"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  openTaskModal,
  setSortConfig,
  openTaskDetail,
  openDeleteConfirm,
  openBulkEdit,
  selectIsDeleteConfirmOpen,
} from "@/features/ui/uiSlice";
import { Task, SortField, SortDirection } from "@/types";
import {
  getStatusBadgeClass,
  getPriorityBadgeClass,
  formatDate,
} from "@/lib/utils";

const ListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const filterConfig = useAppSelector((state) => state.ui.filterConfig);
  const sortConfig = useAppSelector((state) => state.ui.sortConfig);
  const isDeleteConfirmOpen = useAppSelector(selectIsDeleteConfirmOpen);

  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set()
  );

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  useEffect(() => {
    const taskIdsSet = new Set(tasks.map((task) => task.id));

    const updatedSelections = new Set<string>();
    selectedTaskIds.forEach((id) => {
      if (taskIdsSet.has(id)) {
        updatedSelections.add(id);
      }
    });

    setSelectedTaskIds(updatedSelections);
  }, [tasks]);

  useEffect(() => {
    if (!isDeleteConfirmOpen) {
    }
  }, [isDeleteConfirmOpen]);

  const filteredAndSortedTasks = React.useMemo(() => {
    let result = tasks.filter((task) => {
      if (
        filterConfig.status !== "all" &&
        task.status !== filterConfig.status
      ) {
        return false;
      }

      if (
        filterConfig.priority !== "all" &&
        task.priority !== filterConfig.priority
      ) {
        return false;
      }

      if (
        filterConfig.searchTerm &&
        !task.title
          .toLowerCase()
          .includes(filterConfig.searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      const { field, direction } = sortConfig;
      const multiplier = direction === "asc" ? 1 : -1;

      if (field === "createdAt" || field === "updatedAt") {
        return (
          multiplier *
          (new Date(a[field]).getTime() - new Date(b[field]).getTime())
        );
      }

      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return multiplier * a[field].localeCompare(b[field] as string);
      }

      return 0;
    });

    return result;
  }, [tasks, filterConfig, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig]);

  const paginatedTasks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    return filteredAndSortedTasks.slice(startIndex, startIndex + tasksPerPage);
  }, [filteredAndSortedTasks, currentPage, tasksPerPage]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / tasksPerPage);

  const handleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      const newDirection: SortDirection =
        sortConfig.direction === "asc" ? "desc" : "asc";
      dispatch(setSortConfig({ field, direction: newDirection }));
    } else {
      dispatch(setSortConfig({ field, direction: "desc" }));
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleEditTask = (task: Task) => {
    dispatch(openTaskModal(task.id));
  };

  const handleDeleteTask = (id: string) => {
    dispatch(openDeleteConfirm(id));
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.size === 0) return;

    dispatch(openDeleteConfirm(Array.from(selectedTaskIds)));
  };

  const toggleTaskSelection = (id: string) => {
    const newSelection = new Set(selectedTaskIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTaskIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.size === paginatedTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      const newSelection = new Set<string>();
      paginatedTasks.forEach((task) => newSelection.add(task.id));
      setSelectedTaskIds(newSelection);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const pageButtonClass = (active: boolean, disabled?: boolean) =>
    `relative inline-flex items-center px-3 py-1.5 text-sm font-medium border border-black/10 transition-colors dark:border-white/10 ${
      disabled
        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-900 dark:text-zinc-600"
        : active
        ? "z-10 bg-violet-50 border-violet-300 text-violet-700 dark:bg-violet-500/15 dark:border-violet-500/40 dark:text-violet-300"
        : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    }`;

  return (
    <div className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm dark:border-white/5 dark:bg-zinc-950">
      {selectedTaskIds.size > 0 && (
        <div className="flex items-center justify-between border-b border-black/5 bg-violet-50 px-4 py-2 dark:border-white/5 dark:bg-violet-500/10">
          <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
            {selectedTaskIds.size}{" "}
            {selectedTaskIds.size === 1 ? "task" : "tasks"} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                dispatch(
                  openBulkEdit({
                    type: "status",
                    taskIds: Array.from(selectedTaskIds),
                  })
                )
              }
              className="rounded bg-violet-600 px-3 py-1 text-sm text-white transition-colors hover:bg-violet-500"
            >
              Change Status
            </button>
            <button
              onClick={() =>
                dispatch(
                  openBulkEdit({
                    type: "priority",
                    taskIds: Array.from(selectedTaskIds),
                  })
                )
              }
              className="rounded bg-violet-600 px-3 py-1 text-sm text-white transition-colors hover:bg-violet-500"
            >
              Change Priority
            </button>
            <button
              onClick={handleBulkDelete}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-500"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-black/5 dark:divide-white/5">
          <thead className="bg-zinc-50 dark:bg-zinc-900/60">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    paginatedTasks.length > 0 &&
                    selectedTaskIds.size === paginatedTasks.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => handleSort("title")}
              >
                Title {getSortIndicator("title")}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => handleSort("status")}
              >
                Status {getSortIndicator("status")}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => handleSort("priority")}
              >
                Priority {getSortIndicator("priority")}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={() => handleSort("updatedAt")}
              >
                Updated {getSortIndicator("updatedAt")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {paginatedTasks.map((task) => (
              <tr
                key={task.id}
                className="bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900/50"
              >
                <td className="whitespace-nowrap px-3 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                </td>
                <td className="px-6 py-4">
                  <div
                    className="cursor-pointer text-sm font-medium text-zinc-900 hover:text-violet-600 dark:text-zinc-100 dark:hover:text-violet-400"
                    onClick={() => dispatch(openTaskDetail(task.id))}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="max-w-xs truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {task.description}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-5 ${getStatusBadgeClass(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-5 ${getPriorityBadgeClass(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(task.updatedAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="mr-2 rounded p-1 text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded p-1 text-zinc-400 hover:bg-red-500/10 hover:text-red-500"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedTasks.length === 0 && (
              <tr className="bg-white dark:bg-zinc-950">
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No tasks found. Create a new task to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-black/5 bg-white px-4 py-3 dark:border-white/5 dark:bg-zinc-950 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={pageButtonClass(false, currentPage === 1) + " rounded-md"}
            >
              Previous
            </button>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={pageButtonClass(false, currentPage === totalPages) + " ml-3 rounded-md"}
            >
              Next
            </button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Showing{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {(currentPage - 1) * tasksPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {Math.min(
                    currentPage * tasksPerPage,
                    filteredAndSortedTasks.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {filteredAndSortedTasks.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={pageButtonClass(false, currentPage === 1) + " rounded-l-md"}
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={pageButtonClass(false, currentPage === 1)}
                >
                  Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={pageButtonClass(currentPage === pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={pageButtonClass(false, currentPage === totalPages)}
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={pageButtonClass(false, currentPage === totalPages) + " rounded-r-md"}
                >
                  Last
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListView;
