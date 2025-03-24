import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FilterConfig, TaskPriority, TaskStatus, UiState } from "../../types";

const initialState: UiState = {
  sortConfig: {
    field: "createdAt",
    direction: "desc",
  },
  filterConfig: {
    status: "all",
    priority: "all",
    searchTerm: "",
  },
  isTaskModelOpen: false,
  isEditingTaskId: null,
};
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSortConfig: (state, action) => {
      // If same field is clicked, toggle direction
      if (
        action.payload.field === state.sortConfig.field &&
        !action.payload.direction
      ) {
        state.sortConfig.direction =
          state.sortConfig.direction === "asc" ? "desc" : "asc";
      } else {
        // Otherwise, update with new config
        state.sortConfig = {
          ...state.sortConfig,
          ...action.payload,
        };
      }
    },
    // Update status filter
    setFilterStatus: (state, action: PayloadAction<TaskStatus | "all">) => {
      state.filterConfig.status = action.payload;
    },
    // Update priority filter
    setFilterPriority: (state, action: PayloadAction<TaskPriority | "all">) => {
      state.filterConfig.priority = action.payload;
    },

    // Update search term
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filterConfig.searchTerm = action.payload;
    },
    openTaskModal: (state, action) => {
      state.isTaskModelOpen = true;
      state.isEditingTaskId = action.payload;
    },
    closeTaskModal: (state) => {
      state.isTaskModelOpen = false;
      state.isEditingTaskId = null;
    },
  },
});
export const {
  setSortConfig,
  openTaskModal,
  closeTaskModal,
  setFilterPriority,
  setFilterStatus,
  setSearchTerm,
} = uiSlice.actions;
export default uiSlice.reducer;
