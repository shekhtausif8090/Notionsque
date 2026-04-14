"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { useAppDispatch, useAppSelector } from "./hooks";
import { addTask } from "../features/tasks/tasksSlice";
import { getWelcomeTasks } from "../utils/welcomeTasks";
import { Task } from "../types";

function WelcomeTasksSeeder() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items as Task[]);
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
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WelcomeTasksSeeder />
        {children}
      </PersistGate>
    </Provider>
  );
}
