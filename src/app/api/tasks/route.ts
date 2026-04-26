import { NextRequest } from "next/server";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import {
  createTaskSchema,
  listQuerySchema,
} from "@/lib/api/validators";
import { apiError, apiOk, apiZodError, parseJson } from "@/lib/api/response";
import { serializeTask } from "@/lib/api/serialize";
import { toDbPriority, toDbStatus } from "@/lib/api/mappers";

const sortColumnMap = {
  title: tasks.title,
  status: tasks.status,
  priority: tasks.priority,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt,
  position: tasks.position,
} as const;

// GET /api/tasks
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries())
  );
  if (!parsed.success) return apiZodError(parsed.error);
  const { status, priority, search, sortBy, sortDir } = parsed.data;

  const filters = [];
  if (status && status !== "all") filters.push(eq(tasks.status, toDbStatus(status)));
  if (priority && priority !== "all")
    filters.push(eq(tasks.priority, toDbPriority(priority)));
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    filters.push(
      or(ilike(tasks.title, term), ilike(tasks.description, term))!
    );
  }

  const orderCol = sortColumnMap[sortBy ?? "position"];
  const orderFn = sortDir === "desc" ? desc : asc;

  try {
    const rows = await db
      .select()
      .from(tasks)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(orderFn(orderCol), asc(tasks.createdAt));
    return apiOk(rows.map(serializeTask));
  } catch (err) {
    console.error("GET /api/tasks", err);
    return apiError("Failed to fetch tasks", 500);
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const body = await parseJson(req);
  if (body === null) return apiError("Invalid JSON body");
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) return apiZodError(parsed.error);

  const { title, description, status, priority, customFields } = parsed.data;
  const dbPriority = toDbPriority(priority);

  try {
    const [row] = await db
      .insert(tasks)
      .values({
        title,
        description,
        status: toDbStatus(status),
        priority: dbPriority,
        customFields,
        position: sql`COALESCE((SELECT MAX(${tasks.position}) + 1 FROM ${tasks} WHERE ${tasks.priority} = ${dbPriority}), 0)`,
      })
      .returning();
    return apiOk(serializeTask(row), 201);
  } catch (err) {
    console.error("POST /api/tasks", err);
    return apiError("Failed to create task", 500);
  }
}
