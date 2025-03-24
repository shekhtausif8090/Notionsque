import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { openTaskModal, setSortConfig } from "../features/ui/uiSlice";
import { deleteTasks, deleteTask } from "../features/tasks/tasksSlice";
import { SortDirection, SortField, TaskPriority, TaskStatus } from "../types";
import { formatDate } from "../utils/util";
import Pagination from "./Pagination";

const Table = () => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set()
  );
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const sortConfig = useAppSelector((state) => state.ui.sortConfig);
  const filterConfig = useAppSelector((state) => state.ui.filterConfig);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  const handleEdit = (id: string) => {
    dispatch(openTaskModal(id));
  };

  // Filter and sort tasks based on current configuration
  const filteredAndSortedTasks = React.useMemo(() => {
    let result = tasks.filter((task) => {
      // Filter by status
      if (
        filterConfig.status !== "all" &&
        task.status !== filterConfig.status
      ) {
        return false;
      }

      // Filter by priority
      if (
        filterConfig.priority !== "all" &&
        task.priority !== filterConfig.priority
      ) {
        return false;
      }

      // Filter by search term
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

    // Then, sort the filtered tasks
    result.sort((a, b) => {
      const { field, direction } = sortConfig;
      const multiplier = direction === "asc" ? 1 : -1;

      // Handle date fields
      if (field === "createdAt" || field === "updatedAt") {
        return (
          multiplier *
          (new Date(a[field]).getTime() - new Date(b[field]).getTime())
        );
      }
      console.log(a, b);

      // Handle string fields
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return multiplier * a[field].localeCompare(b[field] as string);
      }

      return 0;
    });

    return result;
  }, [tasks, sortConfig, filterConfig]);

  const handleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      // Toggle direction if same field
      const newDirection: SortDirection =
        sortConfig.direction === "asc" ? "desc" : "asc";
      dispatch(setSortConfig({ field, direction: newDirection }));
    } else {
      // Set new field with default descending
      dispatch(setSortConfig({ field, direction: "desc" }));
    }
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
    if (tasks.length === selectedTaskIds.size) {
      setSelectedTaskIds(new Set<string>());
    } else {
      const newSelection = new Set<string>();
      tasks.forEach((task) => newSelection.add(task.id));
      setSelectedTaskIds(newSelection);
    }
  };
  //delete selected ids tasks
  const handleBulkDelete = () => {
    if (selectedTaskIds.size === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedTaskIds.size} tasks?`
      )
    ) {
      dispatch(deleteTasks(Array.from(selectedTaskIds)));
      setSelectedTaskIds(new Set());
    }
  };
  const getSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Get paginated tasks
  const paginatedTasks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return filteredAndSortedTasks.slice(startIndex, endIndex);
  }, [filteredAndSortedTasks, currentPage, tasksPerPage]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / tasksPerPage);

  // Pagination navigation
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(id));
      // Remove from selection if it was selected
      if (selectedTaskIds.has(id)) {
        const newSelection = new Set(selectedTaskIds);
        newSelection.delete(id);
        setSelectedTaskIds(newSelection);
      }
    }
  };

  // Style classes for status badges
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

  // Style classes for priority badges
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

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      {selectedTaskIds.size > 0 && (
        <div className="bg-blue-50 px-4 py-2 flex items-center justify-between border-b">
          <span className="text-sm text-blue-700 font-medium">
            {selectedTaskIds.size} {""}
            {selectedTaskIds.size === 1 ? "task" : "tasks"} selected
          </span>
          <button
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </button>
        </div>
      )}

      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking cursor-pointer">
              <input
                type="checkbox"
                checked={
                  tasks.length > 0 && tasks.length === selectedTaskIds.size
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Title {getSortIndicator("title")}
            </th>

            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status {getSortIndicator("status")}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking cursor-pointer"
              onClick={() => handleSort("priority")}
            >
              Priority {getSortIndicator("priority")}
            </th>
            <th
              className=" px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking cursor-pointer"
              onClick={() => handleSort("updatedAt")}
            >
              Updated {getSortIndicator("updatedAt")}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedTasks?.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-left whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.has(item.id)}
                  onChange={() => toggleTaskSelection(item.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 text-left whitespace-nowrap">
                <span className="text-sm font-medium">
                  {item.title}
                  {item.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {item.description}
                    </div>
                  )}
                </span>
              </td>
              <td className="px-6 py-4 text-left whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                    item.status as TaskStatus
                  )}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-left whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(
                    item.priority as TaskPriority
                  )}`}
                >
                  {item.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
                {formatDate(item.updatedAt)}
              </td>

              <td className="px-6 py-4 text-right whitespace-nowrap">
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  onClick={() => handleEdit(item.id)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteTask(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {paginatedTasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                No tasks found. Create a new task to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default Table;
