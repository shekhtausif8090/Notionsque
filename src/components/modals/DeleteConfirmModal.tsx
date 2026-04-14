"use client";

// src/components/modals/DeleteConfirmModal.tsx

import React, { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { closeDeleteConfirm } from "../../features/ui/uiSlice";
import { deleteTask, deleteTasks } from "../../features/tasks/tasksSlice";

const DeleteConfirmModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isDeleteConfirmOpen);
  const taskId = useAppSelector((state) => state.ui.deletingTaskId);
  const deletingTaskIds = useAppSelector((state) => state.ui.deletingTaskIds);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    dispatch(closeDeleteConfirm());
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        tabIndex={-1}
        className="bg-white rounded-lg p-6 w-full max-w-md focus:outline-none"
      >
        <h2
          id="delete-confirm-title"
          className="text-xl font-bold mb-4 text-gray-900"
        >
          Confirm Deletion
        </h2>

        <p className="mb-6 text-gray-700">
          {message} This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
