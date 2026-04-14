"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAppDispatch } from "../../lib/hooks";
import { openDeleteConfirm, openTaskModal } from "../../features/ui/uiSlice";
import { Task } from "../../types";
import {
  getStatusBadgeClass,
  getPriorityBadgeClass,
  formatDate,
} from "../../lib/utils";

interface TaskDetailViewProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  open,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const handleEdit = () => {
    dispatch(openTaskModal(task.id));
    onClose();
  };

  const handleDelete = () => {
    dispatch(openDeleteConfirm(task.id));
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 focus:outline-none">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              Task Details
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Dialog.Close>
          </div>

          <div className="px-6 py-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {task.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadgeClass(
                    task.priority
                  )}`}
                >
                  {task.priority !== "none" ? task.priority : "No priority"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDate(task.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{" "}
                  {formatDate(task.updatedAt)}
                </div>
              </div>
            </div>

            {task.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
                  {task.description}
                </div>
              </div>
            )}

            {Object.keys(task.customFields).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Custom Fields
                </h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(task.customFields).map(([key, value]) => (
                      <div key={key} className="col-span-1">
                        <dt className="font-medium text-gray-700">{key}</dt>
                        <dd className="text-gray-900 mt-1">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskDetailView;
