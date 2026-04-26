import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { customFieldSchema } from "@/lib/api/validators";
import {
  apiError,
  apiOk,
  apiZodError,
  parseJson,
} from "@/lib/api/response";
import { serializeTask } from "@/lib/api/serialize";

type RouteContext = { params: Promise<{ id: string }> };

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// PATCH /api/tasks/[id]/custom-fields
// Body: { key: string; value?: string|number|boolean }
//   value present → set; value omitted → remove key.
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return apiError("Invalid id", 400);

  const body = await parseJson(req);
  if (body === null) return apiError("Invalid JSON body");
  const parsed = customFieldSchema.safeParse(body);
  if (!parsed.success) return apiZodError(parsed.error);

  const { key, value } = parsed.data;

  try {
    const expr =
      value === undefined
        ? sql`${tasks.customFields} - ${key}`
        : sql`jsonb_set(${tasks.customFields}, ${sql.raw(`'{${key.replace(/'/g, "''")}}'`)}, ${JSON.stringify(value)}::jsonb, true)`;

    const [row] = await db
      .update(tasks)
      .set({ customFields: expr, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();

    if (!row) return apiError("Task not found", 404);
    return apiOk(serializeTask(row));
  } catch (err) {
    console.error("PATCH /api/tasks/[id]/custom-fields", err);
    return apiError("Failed to update custom field", 500);
  }
}
