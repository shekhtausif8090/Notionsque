"use client";

// src/components/modals/DeleteConfirmModal.tsx

import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { closeDeleteConfirm } from "../../features/ui/uiSlice";
import { deleteTask, deleteTasks } from "../../features/tasks/tasksSlice";

const DeleteConfirmModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isDeleteConfirmOpen);
  const taskId = useAppSelector((state) => state.ui.deletingTaskId);
  const deletingTaskIds = useAppSelector((state) => state.ui.deletingTaskIds);

  const handleClose = () => {
    dispatch(closeDeleteConfirm());
  };

  const handleDelete = () => {
    if (!taskId && deletingTaskIds.length > 0) {
      dispatch(deleteTasks(deletingTaskIds));
    } else if (taskId) {
      dispatch(deleteTask(taskId));
    }
    handleClose();
  };

  const message = taskId
    ? "Are you sure you want to delete this task?"
    : `Are you sure you want to delete ${deletingTaskIds.length} tasks?`;

  return (
    <AlertDialog.Root
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50 focus:outline-none">
          <AlertDialog.Title className="text-xl font-bold mb-4 text-gray-900">
            Confirm Deletion
          </AlertDialog.Title>

          <AlertDialog.Description className="mb-6 text-gray-700">
            {message} This action cannot be undone.
          </AlertDialog.Description>

          <div className="flex justify-end space-x-3">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default DeleteConfirmModal;
