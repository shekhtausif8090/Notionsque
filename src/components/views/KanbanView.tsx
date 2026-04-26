"use client";

import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  openTaskModal,
  openTaskDetail,
  openDeleteConfirm,
} from "@/features/ui/uiSlice";
import {
  updateTaskPriority,
  reorderTasks,
  addTask,
} from "@/features/tasks/tasksSlice";
import { TaskPriority, Task } from "@/types";
import { getStatusBadgeClass } from "@/lib/utils";

const priorityDotClass = (priority: TaskPriority): string => {
  switch (priority) {
    case "urgent":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-emerald-500";
    default:
      return "bg-zinc-400 dark:bg-zinc-500";
  }
};

const KanbanView: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const filterConfig = useAppSelector((state) => state.ui.filterConfig);

  const [newTaskInputs, setNewTaskInputs] = useState<
    Record<TaskPriority, string>
  >({
    none: "",
    low: "",
    medium: "",
    high: "",
    urgent: "",
  });

  const [activeInputColumn, setActiveInputColumn] =
    useState<TaskPriority | null>(null);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (
        filterConfig.status !== "all" &&
        task.status !== filterConfig.status
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
  }, [tasks, filterConfig]);

  const tasksByPriority = React.useMemo(() => {
    const priorityOrder: TaskPriority[] = [
      "none",
      "low",
      "medium",
      "high",
      "urgent",
    ];
    const grouped = priorityOrder.reduce((acc, priority) => {
      const priorityTasks = filteredTasks
        .filter((task) => task.priority === priority)
        .sort((a, b) => {
          if (a.position === undefined && b.position === undefined) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          if (a.position === undefined) return 1;
          if (b.position === undefined) return -1;
          return a.position - b.position;
        });

      acc[priority] = priorityTasks;
      return acc;
    }, {} as Record<TaskPriority, typeof filteredTasks>);

    return grouped;
  }, [filteredTasks]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourcePriority = source.droppableId as TaskPriority;
    const destinationPriority = destination.droppableId as TaskPriority;

    const taskId = result.draggableId;

    if (sourcePriority !== destinationPriority) {
      dispatch(
        updateTaskPriority({
          id: taskId,
          priority: destinationPriority,
          destinationIndex: destination.index,
        })
      );
    } else {
      const columnTasks = tasksByPriority[sourcePriority];
      const reorderedTasks = Array.from(columnTasks);

      const [movedTask] = reorderedTasks.splice(source.index, 1);

      reorderedTasks.splice(destination.index, 0, movedTask);

      const newOrder = reorderedTasks.map((task) => task.id);

      dispatch(
        reorderTasks({
          priority: sourcePriority,
          taskIds: newOrder,
        })
      );
    }
  };

  const handleShowInput = (priority: TaskPriority) => {
    setActiveInputColumn(priority);
  };

  const handleInputChange = (priority: TaskPriority, value: string) => {
    setNewTaskInputs((prev) => ({
      ...prev,
      [priority]: value,
    }));
  };

  const handleCreateTask = (priority: TaskPriority) => {
    const title = newTaskInputs[priority].trim();
    if (title) {
      dispatch(
        addTask({
          title,
          description: "",
          status: "not started",
          priority,
          customFields: {},
        })
      );

      setNewTaskInputs((prev) => ({
        ...prev,
        [priority]: "",
      }));
      setActiveInputColumn(null);
    }
  };

  const handleCancelTask = () => {
    setActiveInputColumn(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, priority: TaskPriority) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask(priority);
    } else if (e.key === "Escape") {
      handleCancelTask();
    }
  };

  const getPriorityName = (priority: TaskPriority): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const handleEditTask = (taskId: string) => {
    dispatch(openTaskModal(taskId));
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch(openDeleteConfirm(taskId));
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="group rounded-md border border-black/5 bg-white p-3 transition-all hover:border-black/10 hover:shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <h4
          className="line-clamp-2 cursor-pointer text-sm font-medium text-zinc-900 hover:text-violet-600 dark:text-zinc-100 dark:hover:text-violet-400"
          onClick={() => dispatch(openTaskDetail(task.id))}
        >
          {task.title}
        </h4>

        <div className="flex flex-shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => handleEditTask(task.id)}
            className="rounded p-1 text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100"
            title="Edit task"
            aria-label="Edit task"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="rounded p-1 text-zinc-400 hover:bg-red-500/10 hover:text-red-500"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {task.description}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <span
          className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full ${getStatusBadgeClass(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>

      {Object.keys(task.customFields).length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border-black/5 pt-2 dark:border-white/10">
          {Object.entries(task.customFields).map(([key, value]) => (
            <div
              key={key}
              className="text-[11px] text-zinc-500 dark:text-zinc-400"
            >
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                {key}:
              </span>{" "}
              {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-3 overflow-x-auto pb-4">
          {Object.entries(tasksByPriority).map(([priority, priorityTasks]) => (
            <div
              key={priority}
              className="flex w-72 flex-shrink-0 flex-col rounded-xl border border-black/5 bg-zinc-100/60 dark:border-white/5 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${priorityDotClass(
                      priority as TaskPriority
                    )}`}
                  />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                    {getPriorityName(priority as TaskPriority)}
                  </h3>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {priorityTasks.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={priority}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[200px] overflow-y-auto p-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-violet-500/5" : ""
                    }`}
                  >
                    {priorityTasks.length === 0 &&
                    activeInputColumn !== (priority as TaskPriority) ? (
                      <div className="rounded-md border border-dashed border-black/10 p-4 text-center text-xs text-zinc-400 dark:border-white/10 dark:text-zinc-500">
                        Drop tasks here
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {priorityTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={
                                  snapshot.isDragging ? "opacity-70" : ""
                                }
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    )}
                    {provided.placeholder}

                    {activeInputColumn === (priority as TaskPriority) ? (
                      <div className="mt-2 rounded-md border border-black/5 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-zinc-900">
                        <textarea
                          value={newTaskInputs[priority as TaskPriority]}
                          onChange={(e) =>
                            handleInputChange(
                              priority as TaskPriority,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, priority as TaskPriority)
                          }
                          placeholder="Enter task title"
                          className="mb-2 min-h-[60px] w-full resize-y rounded border border-black/10 bg-white p-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleCancelTask}
                            className="rounded px-3 py-1 text-sm text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleCreateTask(priority as TaskPriority)
                            }
                            className="rounded bg-violet-600 px-3 py-1 text-sm text-white hover:bg-violet-500"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleShowInput(priority as TaskPriority)
                        }
                        className="mt-2 flex w-full items-center justify-center gap-1 rounded p-2 text-sm text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100"
                      >
                        <Plus className="h-4 w-4" />
                        Add task
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanView;
