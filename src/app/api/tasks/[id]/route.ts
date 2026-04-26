import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { updateTaskSchema } from "@/lib/api/validators";
import {
  apiError,
  apiOk,
  apiZodError,
  parseJson,
} from "@/lib/api/response";
import { serializeTask } from "@/lib/api/serialize";
import { toDbPriority, toDbStatus } from "@/lib/api/mappers";

type RouteContext = { params: Promise<{ id: string }> };

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// GET /api/tasks/[id]
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return apiError("Invalid id", 400);
  try {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!row) return apiError("Task not found", 404);
    return apiOk(serializeTask(row));
  } catch (err) {
    console.error("GET /api/tasks/[id]", err);
    return apiError("Failed to fetch task", 500);
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return apiError("Invalid id", 400);

  const body = await parseJson(req);
  if (body === null) return apiError("Invalid JSON body");
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) return apiZodError(parsed.error);
  const updates = parsed.data;

  try {
    const [current] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);
    if (!current) return apiError("Task not found", 404);

    const set: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (updates.title !== undefined) set.title = updates.title;
    if (updates.description !== undefined) set.description = updates.description;
    if (updates.status !== undefined) set.status = toDbStatus(updates.status);
    if (updates.customFields !== undefined) set.customFields = updates.customFields;

    const newPriority = updates.priority
      ? toDbPriority(updates.priority)
      : null;
    const priorityChanged = newPriority !== null && newPriority !== current.priority;

    if (priorityChanged) {
      set.priority = newPriority;

      if (updates.destinationIndex !== undefined) {
        // shift dest bucket positions >= destinationIndex up by 1, then insert at destinationIndex
        await db.execute(sql`
          UPDATE ${tasks}
          SET position = position + 1, updated_at = now()
          WHERE priority = ${newPriority}
            AND position >= ${updates.destinationIndex}
            AND id <> ${id}
        `);
        set.position = updates.destinationIndex;
      } else if (updates.position !== undefined) {
        set.position = updates.position;
      } else {
        // append: position = MAX+1 in destination bucket
        const result = await db.execute<{ maxPos: number | null }>(sql`
          SELECT COALESCE(MAX(position), -1) AS "maxPos"
          FROM ${tasks}
          WHERE priority = ${newPriority} AND id <> ${id}
        `);
        const maxPos = result.rows[0]?.maxPos;
        set.position = (maxPos ?? -1) + 1;
      }
    } else if (updates.position !== undefined) {
      set.position = updates.position;
    }

    const [row] = await db
      .update(tasks)
      .set(set)
      .where(eq(tasks.id, id))
      .returning();
    return apiOk(serializeTask(row));
  } catch (err) {
    console.error("PATCH /api/tasks/[id]", err);
    return apiError("Failed to update task", 500);
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return apiError("Invalid id", 400);
  try {
    const [row] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    if (!row) return apiError("Task not found", 404);
    return apiOk({ ok: true, id });
  } catch (err) {
    console.error("DELETE /api/tasks/[id]", err);
    return apiError("Failed to delete task", 500);
  }
}
