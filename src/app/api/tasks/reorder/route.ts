import { NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { reorderSchema } from "@/lib/api/validators";
import {
  apiError,
  apiOk,
  apiZodError,
  parseJson,
} from "@/lib/api/response";
import { toDbPriority } from "@/lib/api/mappers";

// PATCH /api/tasks/reorder
// Body: { priority, orderedIds[] }
// Single CASE UPDATE — atomic per Postgres statement.
export async function PATCH(req: NextRequest) {
  const body = await parseJson(req);
  if (body === null) return apiError("Invalid JSON body");
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return apiZodError(parsed.error);

  const { priority, orderedIds } = parsed.data;
  const dbPriority = toDbPriority(priority);

  try {
    // Build CASE WHEN id = $1 THEN 0 WHEN id = $2 THEN 1 ... END
    const cases = orderedIds.map(
      (id, idx) => sql`WHEN id = ${id} THEN ${idx}`
    );

    await db.execute(sql`
      UPDATE ${tasks}
      SET position = CASE ${sql.join(cases, sql` `)} END,
          updated_at = now()
      WHERE priority = ${dbPriority}
        AND id IN ${sql.raw(`(${orderedIds.map((id) => `'${id}'`).join(",")})`)}
    `);

    return apiOk({ ok: true, count: orderedIds.length });
  } catch (err) {
    console.error("PATCH /api/tasks/reorder", err);
    return apiError("Failed to reorder tasks", 500);
  }
}
