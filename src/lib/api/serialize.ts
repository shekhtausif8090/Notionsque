import "server-only";
import type { Task as DbTask } from "@/db/schema";
import type { Task } from "@/types";
import { fromDbStatus, fromDbPriority } from "@/lib/api/mappers";

export function serializeTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: fromDbStatus(row.status),
    priority: fromDbPriority(row.priority),
    position: row.position,
    customFields: row.customFields,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
