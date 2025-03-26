import { TaskPriority, TaskStatus } from "../types";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export const getPriorityColorClass = (priority: TaskPriority): string => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 border-red-500";
    case "high":
      return "bg-orange-100 border-orange-500";
    case "medium":
      return "bg-yellow-100 border-yellow-500";
    case "low":
      return "bg-green-100 border-green-500";
    default:
      return "bg-gray-100 border-gray-400";
  }
};

// Get formatted priority name
export const getPriorityName = (priority: TaskPriority): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

// Get status badge class
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
