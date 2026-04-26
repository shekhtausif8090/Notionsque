"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  openTaskModal,
  setSearchTerm,
  setFilterStatus,
  setFilterPriority,
} from "@/features/ui/uiSlice";
import { TaskStatus, TaskPriority } from "@/types";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const filterConfig = useAppSelector((state) => state.ui.filterConfig);

  const handleCreateTask = () => dispatch(openTaskModal(null));
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setSearchTerm(e.target.value));
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    dispatch(setFilterStatus(e.target.value as TaskStatus | "all"));
  const handlePriorityFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => dispatch(setFilterPriority(e.target.value as TaskPriority | "all"));

  const tabClass = (active: boolean) =>
    `px-3 py-1 rounded-md text-sm font-medium transition-colors ${
      active
        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    }`;

  const fieldClass =
    "px-3 py-2 text-sm rounded-md border border-black/10 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-black/5 dark:bg-[#0b0b0d]/70 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500" />
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Notionesque
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-lg border border-black/5 bg-zinc-100 dark:border-white/5 dark:bg-zinc-900">
              <Link href="/list" className={tabClass(pathname === "/list")}>
                List
              </Link>
              <Link href="/kanban" className={tabClass(pathname === "/kanban")}>
                Kanban
              </Link>
            </div>
            <ThemeToggle />
            <button
              onClick={handleCreateTask}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-violet-600 text-white shadow-sm hover:bg-violet-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New task
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filterConfig.searchTerm}
              onChange={handleSearchChange}
              className={`${fieldClass} w-full pl-9`}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterConfig.status}
              onChange={handleStatusFilterChange}
              className={fieldClass}
            >
              <option value="all">All Status</option>
              <option value="not started">Not Started</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterConfig.priority}
              onChange={handlePriorityFilterChange}
              className={fieldClass}
            >
              <option value="all">All Priorities</option>
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
