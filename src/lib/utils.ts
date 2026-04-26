import { TaskStatus, TaskPriority } from "@/types";

export const getStatusBadgeClass = (status: TaskStatus): string => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    case "in progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
};

export const getPriorityBadgeClass = (priority: TaskPriority): string => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400";
    case "low":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};
