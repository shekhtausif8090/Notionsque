"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore, AppStore } from "./store";
import { useAppDispatch, useAppSelector } from "./hooks";
import { addTask } from "../features/tasks/tasksSlice";
import { getWelcomeTasks } from "../utils/welcomeTasks";
import type { Persistor } from "redux-persist";

function WelcomeTasksSeeder() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const seeded = useRef(false);

  useEffect(() => {
    if (tasks.length === 0 && !seeded.current) {
      seeded.current = true;
      const welcomeTasks = getWelcomeTasks();
      welcomeTasks.forEach((task) => {
        dispatch(addTask(task));
      });
    }
  }, [dispatch, tasks.length]);

  return null;
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<{ store: AppStore; persistor: Persistor } | null>(
    null
  );
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current.store}>
      <PersistGate loading={null} persistor={storeRef.current.persistor}>
        <WelcomeTasksSeeder />
        {children}
      </PersistGate>
    </Provider>
  );
}
