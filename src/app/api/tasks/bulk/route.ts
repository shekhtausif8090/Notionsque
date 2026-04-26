import { NextRequest } from "next/server";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import {
  bulkCreateSchema,
  bulkDeleteSchema,
  bulkUpdateSchema,
} from "@/lib/api/validators";
import {
  apiError,
  apiOk,
  apiZodError,
  parseJson,
} from "@/lib/api/response";
import { serializeTask } from "@/lib/api/serialize";
import { toDbPriority, toDbStatus } from "@/lib/api/mappers";

// POST /api/tasks/bulk
export async function POST(req: NextRequest) {
  const body = await parseJson(req);
  if (body === null) return apiError("Invalid JSON body");
  const parsed = bulkCreateSchema.safeParse(body);
  if (!parsed.success) return apiZodError(parsed.error);

  try {
    // compute starting position per priority bucket from current MAX
    const buckets = new Map<string, number>();
    const inputs = parsed.data.tasks;

    const priorities = Array.from(new Set(inputs.map((t) => toDbPriority(t.priority))));
    if (priorities.length) {
      const result = await db.execute<{ priority: string; maxPos: number | null }>(sql`
        SELECT priority::text AS priority, MAX(position) AS "maxPos"
        FROM ${tasks}
        WHERE priority IN ${sql.raw(`(${priorities.map((p) => `'${p}'`).join(",")})`)}
        GROUP BY priority
      `);
      for (const r of result.rows) buckets.set(r.priority, r.maxPos ?? -1);
    }

    const values = inputs.map((t) => {
      const p = toDbPriority(t.priority);
      const next = (buckets.get(p) ?? -1) + 1;
      buckets.set(p, next);
      return {
        title: t.title,
        description: t.description,
        status: toDbStatus(t.status),
        priority: p,
        customFields: t.customFields,
        position: next,
      };
    });

    const inserted = await db.insert(tasks).values(values).returning();
    return apiOk(inserted.map(serializeTask), 201);
  } catch (err) {
    console.error("POST /api/tasks/bulk", err);
    return apiError("Failed to bulk create tasks", 500);
  }
}

// PATCH /api/tasks/bulk
export async function PATCH(req: NextRequest) {
  const body = await parseJson(req);
  if (body === null) return apiError("Invalid JSON body");
  const parsed = bulkUpdateSchema.safeParse(body);
  if (!parsed.success) return apiZodError(parsed.error);

  const { ids, patch } = parsed.data;

  try {
    if (patch.priority) {
      const dbPriority = toDbPriority(patch.priority);

      const result = await db.execute<{ maxPos: number | null }>(sql`
        SELECT COALESCE(MAX(position), -1) AS "maxPos"
        FROM ${tasks}
        WHERE priority = ${dbPriority}
      `);
      let next = (result.rows[0]?.maxPos ?? -1) + 1;

      const updated = [];
      for (const id of ids) {
        const set: Record<string, unknown> = {
          priority: dbPriority,
          position: next++,
          updatedAt: new Date(),
        };
        if (patch.status) set.status = toDbStatus(patch.status);
        const [row] = await db
          .update(tasks)
          .set(set)
          .where(eq(tasks.id, id))
          .returning();
        if (row) updated.push(serializeTask(row));
      }
      return apiOk(updated);
    }

    // status-only update
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.status) set.status = toDbStatus(patch.status);
    const rows = await db
      .update(tasks)
      .set(set)
      .where(inArray(tasks.id, ids))
      .returning();
    return apiOk(rows.map(serializeTask));
  } catch (err) {
    console.error("PATCH /api/tasks/bulk", err);
    return apiError("Failed to bulk update tasks", 500);
  }
}

// DELETE /api/tasks/bulk
export async function DELETE(req: NextRequest) {
  const body = await parseJson(req);
  if (body === null) return apiError("Invalid JSON body");
  const parsed = bulkDeleteSchema.safeParse(body);
  if (!parsed.success) return apiZodError(parsed.error);

  try {
    const rows = await db
      .delete(tasks)
      .where(inArray(tasks.id, parsed.data.ids))
      .returning({ id: tasks.id });
    return apiOk({ ok: true, deletedIds: rows.map((r) => r.id) });
  } catch (err) {
    console.error("DELETE /api/tasks/bulk", err);
    return apiError("Failed to bulk delete tasks", 500);
  }
}
