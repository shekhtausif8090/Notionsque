import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../features/tasks/tasksSlice";
import uiReducer from "../features/ui/uiSlice";
import { store } from "../app/store";

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;

export function makeStore() {
  return configureStore({
    reducer: {
      tasks: tasksReducer as any,
      ui: uiReducer,
    },
  });
}
