import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  openTaskModal,
  setSortConfig,
  openTaskDetail,
  openDeleteConfirm,
  openBulkEdit,
  selectIsDeleteConfirmOpen,
} from "../../features/ui/uiSlice";
import { deleteTask, deleteTasks } from "../../features/tasks/tasksSlice";
import {
  Task,
  SortField,
  SortDirection,
  TaskStatus,
  TaskPriority,
} from "../../types";

const ListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items as Task[]);
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

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {selectedTaskIds.size > 0 && (
        <div className="bg-blue-50 px-4 py-2 flex items-center justify-between border-b">
          <span className="text-sm text-blue-700 font-medium">
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
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
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
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Change Priority
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    paginatedTasks.length > 0 &&
                    selectedTaskIds.size === paginatedTasks.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Title {getSortIndicator("title")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {getSortIndicator("status")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                Priority {getSortIndicator("priority")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("updatedAt")}
              >
                Updated {getSortIndicator("updatedAt")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div
                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => dispatch(openTaskDetail(task.id))}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {task.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(task.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginatedTasks.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No tasks found. Create a new task to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * tasksPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * tasksPerPage,
                    filteredAndSortedTasks.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredAndSortedTasks.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
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
