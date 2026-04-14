"use client";

import Header from "../../components/layout/Header";
import KanbanView from "../../components/views/KanbanView";
import TaskModal from "../../components/modals/TaskModal";
import BulkEditModal from "../../components/modals/BulkEditModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import TaskDetailView from "../../components/task/TaskDetailView";
import { useAppSelector, useAppDispatch } from "../../lib/hooks";
import { closeTaskDetail } from "../../features/ui/uiSlice";
import { Task } from "../../types";

export default function KanbanPage() {
  const dispatch = useAppDispatch();
  const isTaskDetailOpen = useAppSelector(
    (state) => state.ui.isTaskDetailOpen
  );
  const viewingTaskId = useAppSelector((state) => state.ui.viewingTaskId);
  const tasks = useAppSelector((state) => state.tasks.items as Task[]);

  const taskBeingViewed = viewingTaskId
    ? tasks.find((task: Task) => task.id === viewingTaskId)
    : null;

  return (
    <>
      <Header />
      <main>
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <KanbanView />
        </div>
      </main>
      <TaskModal />
      {isTaskDetailOpen && taskBeingViewed && (
        <TaskDetailView
          task={taskBeingViewed}
          onClose={() => dispatch(closeTaskDetail())}
        />
      )}
      <DeleteConfirmModal />
      <BulkEditModal />
    </>
  );
}
