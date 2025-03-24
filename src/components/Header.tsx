import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  openTaskModal,
  setFilterPriority,
  setFilterStatus,
  setSearchTerm,
} from "../features/ui/uiSlice";
import { TaskPriority, TaskStatus } from "../types";

const Header = () => {
  const dispatch = useAppDispatch();
  const filterConfig = useAppSelector((state) => state.ui.filterConfig);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Handle status filter changes
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setFilterStatus(e.target.value as TaskStatus | "all"));
  };

  // Handle priority filter changes
  const handlePriorityFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setFilterPriority(e.target.value as TaskPriority | "all"));
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-indigo-600">
                Notionesque
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch(openTaskModal(null))}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create Task
            </button>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                List View
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                Kanban
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filterConfig.searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-row gap-4">
            <select
              id="status"
              value={filterConfig.status}
              onChange={handleStatusFilterChange}
              className="block w-40 px-3 py-2 text-md text-gray-700 bg-gray-50 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="not started">Not Started</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              id="priority"
              value={filterConfig.priority}
              onChange={handlePriorityFilterChange}
              className="block w-40 px-3 py-2 text-md text-gray-700 bg-gray-50 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low </option>
              <option value="medium">Medium </option>
              <option value="high">High </option>
              <option value="urgent">Urgent </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
