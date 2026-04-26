import type { TaskStatus, TaskPriority } from "@/types";

type DbTaskStatus = "not_started" | "in_progress" | "completed";
type DbTaskPriority = TaskPriority;

const statusToDb: Record<TaskStatus, DbTaskStatus> = {
  "not started": "not_started",
  "in progress": "in_progress",
  completed: "completed",
};

const statusFromDb: Record<DbTaskStatus, TaskStatus> = {
  not_started: "not started",
  in_progress: "in progress",
  completed: "completed",
};

export const toDbStatus = (s: TaskStatus): DbTaskStatus => statusToDb[s];
export const fromDbStatus = (s: DbTaskStatus): TaskStatus => statusFromDb[s];

export const toDbPriority = (p: TaskPriority): DbTaskPriority => p;
export const fromDbPriority = (p: DbTaskPriority): TaskPriority => p;
