import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ViewMode,
  SortField,
  SortDirection,
  SortConfig,
  FilterConfig,
  TaskStatus,
  TaskPriority,
} from "../../types";

interface UiState {
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

const initialState: UiState = {
  viewMode: "list",
  sortConfig: {
    field: "createdAt",
    direction: "desc",
  },
  filterConfig: {
    status: "all",
    priority: "all",
    searchTerm: "",
  },
  isTaskModalOpen: false,
  editingTaskId: null,
  isTaskDetailOpen: false,
  viewingTaskId: null,
  isDeleteConfirmOpen: false,
  deletingTaskId: null,
  deletingTaskIds: [],
  isBulkEditOpen: false,
  bulkEditType: null,
  selectedTaskIds: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },

    setSortConfig: (state, action: PayloadAction<Partial<SortConfig>>) => {
      if (
        action.payload.field === state.sortConfig.field &&
        !action.payload.direction
      ) {
        state.sortConfig.direction =
          state.sortConfig.direction === "asc" ? "desc" : "asc";
      } else {
        state.sortConfig = {
          ...state.sortConfig,
          ...action.payload,
        };
      }
    },

    setFilterStatus: (state, action: PayloadAction<TaskStatus | "all">) => {
      state.filterConfig.status = action.payload;
    },

    setFilterPriority: (state, action: PayloadAction<TaskPriority | "all">) => {
      state.filterConfig.priority = action.payload;
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filterConfig.searchTerm = action.payload;
    },

    openTaskModal: (state, action: PayloadAction<string | null>) => {
      state.isTaskModalOpen = true;
      state.editingTaskId = action.payload; // null for new task, task ID for editing
    },

    closeTaskModal: (state) => {
      state.isTaskModalOpen = false;
      state.editingTaskId = null;
    },

    openTaskDetail: (state, action: PayloadAction<string>) => {
      state.isTaskDetailOpen = true;
      state.viewingTaskId = action.payload;
      state.isTaskModalOpen = false;
      state.editingTaskId = null;
    },

    closeTaskDetail: (state) => {
      state.isTaskDetailOpen = false;
      state.viewingTaskId = null;
    },

    openDeleteConfirm: (state, action: PayloadAction<string | string[]>) => {
      state.isDeleteConfirmOpen = true;

      if (Array.isArray(action.payload)) {
        state.deletingTaskId = null;
        state.deletingTaskIds = action.payload;
      } else {
        state.deletingTaskId = action.payload;
        state.deletingTaskIds = [];
      }
    },

    closeDeleteConfirm: (state) => {
      state.isDeleteConfirmOpen = false;
      state.deletingTaskId = null;
      state.deletingTaskIds = [];
    },

    openBulkEdit: (
      state,
      action: PayloadAction<{
        type: "status" | "priority";
        taskIds: string[];
      }>
    ) => {
      state.isBulkEditOpen = true;
      state.bulkEditType = action.payload.type;
      state.selectedTaskIds = action.payload.taskIds;
    },

    closeBulkEdit: (state) => {
      state.isBulkEditOpen = false;
      state.bulkEditType = null;
    },
  },
});

export const {
  setViewMode,
  setSortConfig,
  setFilterStatus,
  setFilterPriority,
  setSearchTerm,
  openTaskModal,
  closeTaskModal,
  openTaskDetail,
  closeTaskDetail,
  openDeleteConfirm,
  closeDeleteConfirm,
  openBulkEdit,
  closeBulkEdit,
} = uiSlice.actions;

export default uiSlice.reducer;

export const selectViewMode = (state: { ui: UiState }) => state.ui.viewMode;
export const selectSortConfig = (state: { ui: UiState }) => state.ui.sortConfig;
export const selectFilterConfig = (state: { ui: UiState }) =>
  state.ui.filterConfig;
export const selectIsTaskModalOpen = (state: { ui: UiState }) =>
  state.ui.isTaskModalOpen;
export const selectEditingTaskId = (state: { ui: UiState }) =>
  state.ui.editingTaskId;
export const selectIsTaskDetailOpen = (state: { ui: UiState }) =>
  state.ui.isTaskDetailOpen;
export const selectViewingTaskId = (state: { ui: UiState }) =>
  state.ui.viewingTaskId;
export const selectIsDeleteConfirmOpen = (state: { ui: UiState }) =>
  state.ui.isDeleteConfirmOpen;
export const selectDeletingTaskId = (state: { ui: UiState }) =>
  state.ui.deletingTaskId;
export const selectIsBulkEditOpen = (state: { ui: UiState }) =>
  state.ui.isBulkEditOpen;
export const selectBulkEditType = (state: { ui: UiState }) =>
  state.ui.bulkEditType;
export const selectSelectedTaskIds = (state: { ui: UiState }) =>
  state.ui.selectedTaskIds;
