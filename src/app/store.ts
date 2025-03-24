import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "../features/tasks/tasksSlice";
import uiSlice from "../features/ui/uiSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "tasks",
  storage,
};

export const store = configureStore({
  reducer: {
    tasks: persistReducer(persistConfig, taskReducer) as any,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
// Create the persistor for the store
export const persistor = persistStore(store);

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
