"use client";

import Header from "../../components/layout/Header";
import TaskModal from "../../components/modals/TaskModal";
import BulkEditModal from "../../components/modals/BulkEditModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import TaskDetailView from "../../components/task/TaskDetailView";
import { useAppSelector, useAppDispatch } from "../../lib/hooks";
import { closeTaskDetail } from "../../features/ui/uiSlice";

export default function ViewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const isTaskDetailOpen = useAppSelector(
    (state) => state.ui.isTaskDetailOpen
  );
  const viewingTaskId = useAppSelector((state) => state.ui.viewingTaskId);
  const tasks = useAppSelector((state) => state.tasks.items);

  const taskBeingViewed = viewingTaskId
    ? tasks.find((task) => task.id === viewingTaskId)
    : null;

  return (
    <>
      <Header />
      <main>
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <TaskModal />
      {taskBeingViewed && (
        <TaskDetailView
          task={taskBeingViewed}
          open={isTaskDetailOpen}
          onClose={() => dispatch(closeTaskDetail())}
        />
      )}
      <DeleteConfirmModal />
      <BulkEditModal />
    </>
  );
}
