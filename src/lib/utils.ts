import { TaskStatus, TaskPriority } from "../types";

export const getStatusBadgeClass = (status: TaskStatus): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPriorityBadgeClass = (priority: TaskPriority): string => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};
