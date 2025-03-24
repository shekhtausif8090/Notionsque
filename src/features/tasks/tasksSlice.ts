import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../../types";
import { current } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

interface TasksState {
  items: Task[]; // Array of all tasks
}

const initialState: TasksState = {
  items: [],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    createTask: (
      state,
      action: PayloadAction<Omit<Task, "id" | "createdAt" | "updatedAt">>
    ) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      console.log(newTask);
      state.items.push(newTask);
    },
    updateTask: (
      state,
      action: PayloadAction<{
        id: string;
        updatedTask: Partial<Omit<Task, "id" | "createdAt">>;
      }>
    ) => {
      const { id, updatedTask } = action.payload;
      const taskIndex = state.items.findIndex((task) => task.id === id);

      if (taskIndex !== -1) {
        state.items[taskIndex] = {
          ...state.items[taskIndex],
          ...updatedTask,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
    deleteTasks: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter(
        (task) => !action.payload.includes(task.id)
      );
    },
  },
});
export const { createTask, updateTask, deleteTasks, deleteTask } =
  tasksSlice.actions;
export default tasksSlice.reducer;
