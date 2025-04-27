export type TaskStatus = "not started" | "in progress" | "completed";

export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  createdAt: string;
  updatedAt: string;
  customFields: Record<string, string | number | boolean>;
}

export type ViewMode = "list" | "kanban";

export type SortField =
  | "title"
  | "status"
  | "priority"
  | "createdAt"
  | "updatedAt";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  searchTerm: string;
}

export interface TasksState {
  items: Task[];
}

export interface StateWithHistory<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UiState {
  viewMode: ViewMode;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  isTaskModalOpen: boolean;
  editingTaskId: string | null;
  isTaskDetailOpen: boolean;
  viewingTaskId: string | null;
  isDeleteConfirmOpen: boolean;
  deletingTaskId: string | null;
  deletingTaskIds: string[];
  isBulkEditOpen: boolean;
  bulkEditType: "status" | "priority" | null;
  selectedTaskIds: string[];
}

export interface RootState {
  tasks: TasksState;
  ui: UiState;
}
