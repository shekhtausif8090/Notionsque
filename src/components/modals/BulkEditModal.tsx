"use client";

// src/components/modals/BulkEditModal.tsx
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { closeBulkEdit } from "../../features/ui/uiSlice";
import { bulkUpdateTasks } from "../../features/tasks/tasksSlice";
import { TaskStatus, TaskPriority } from "../../types";

const BulkEditModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isBulkEditOpen);
  const editType = useAppSelector((state) => state.ui.bulkEditType);
  const selectedTaskIds = useAppSelector((state) => state.ui.selectedTaskIds);

  const [status, setStatus] = useState<TaskStatus>("not started");
  const [priority, setPriority] = useState<TaskPriority>("none");

  const handleClose = () => {
    dispatch(closeBulkEdit());
  };

  const handleApply = () => {
    if (!editType || selectedTaskIds.length === 0) return;

    const updates = editType === "status" ? { status } : { priority };

    dispatch(
      bulkUpdateTasks({
        taskIds: selectedTaskIds,
        updates,
      })
    );

    handleClose();
  };

  const shouldShow = isOpen && !!editType && selectedTaskIds.length > 0;

  return (
    <Dialog.Root
      open={shouldShow}
      onOpenChange={(open) => !open && handleClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50 focus:outline-none">
          <Dialog.Title className="text-xl font-bold mb-4 text-gray-900">
            Bulk Edit {editType === "status" ? "Status" : "Priority"}
          </Dialog.Title>

          <Dialog.Description className="mb-4 text-gray-700">
            Editing {selectedTaskIds.length}{" "}
            {selectedTaskIds.length === 1 ? "task" : "tasks"}
          </Dialog.Description>

          {editType === "status" ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="not started">Not Started</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Dialog.Close asChild>
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BulkEditModal;
