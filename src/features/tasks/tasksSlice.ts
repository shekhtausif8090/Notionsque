import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { Task, TaskPriority } from "../../types";

interface TasksState {
  items: Task[];
}

const initialState: TasksState = {
  items: [],
};

interface ReorderTasksPayload {
  priority: TaskPriority;
  taskIds: string[];
}

interface UpdateTaskPriorityPayload {
  id: string;
  priority: TaskPriority;
  destinationIndex?: number;
}

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (
      state,
      action: PayloadAction<
        Omit<Task, "id" | "createdAt" | "updatedAt" | "position">
      >
    ) => {
      const now = new Date().toISOString();

      const tasksWithSamePriority = state.items.filter(
        (task) => task.priority === action.payload.priority
      );
      console.log(...tasksWithSamePriority.map((t) => t.position || 0));

      const position = tasksWithSamePriority.length
        ? Math.max(...tasksWithSamePriority.map((t) => t.position || 0)) + 1
        : 0;

      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        position,
        createdAt: now,
        updatedAt: now,
      };

      state.items.push(newTask);
    },

    updateTask: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Omit<Task, "id" | "createdAt">>;
      }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex((task) => task.id === id);

      if (index !== -1) {
        const oldPriority = state.items[index].priority;
        const newPriority = updates.priority;

        if (newPriority && newPriority !== oldPriority) {
          const tasksInNewPriority = state.items.filter(
            (t) => t.priority === newPriority
          );
          const newPosition = tasksInNewPriority.length
            ? Math.max(...tasksInNewPriority.map((t) => t.position || 0)) + 1
            : 0;

          updates.position = newPosition;
        }

        state.items[index] = {
          ...state.items[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },

    deleteTasks: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter(
        (task) => !action.payload.includes(task.id)
      );
    },

    updateTaskPriority: (
      state,
      action: PayloadAction<UpdateTaskPriorityPayload>
    ) => {
      const { id, priority, destinationIndex } = action.payload;
      const index = state.items.findIndex((task) => task.id === id);

      if (index !== -1) {
        const oldPriority = state.items[index].priority;

        if (oldPriority !== priority) {
          let newPosition;

          const tasksInDestPriority = state.items.filter(
            (t) => t.priority === priority
          );

          if (
            destinationIndex !== undefined &&
            tasksInDestPriority.length > 0
          ) {
            const sortedTasks = [...tasksInDestPriority].sort(
              (a, b) => (a.position || 0) - (b.position || 0)
            );

            if (destinationIndex >= sortedTasks.length) {
              const maxPosition = Math.max(
                ...sortedTasks.map((t) => t.position || 0)
              );
              newPosition = maxPosition + 1;
            } else {
              const positionAtDrop =
                sortedTasks[destinationIndex].position || 0;

              state.items.forEach((task) => {
                if (
                  task.priority === priority &&
                  task.position !== undefined &&
                  task.position >= positionAtDrop
                ) {
                  task.position += 1;
                }
              });

              newPosition = positionAtDrop;
            }
          } else {
            newPosition = tasksInDestPriority.length
              ? Math.max(...tasksInDestPriority.map((t) => t.position || 0)) + 1
              : 0;
          }

          state.items[index] = {
            ...state.items[index],
            priority,
            position: newPosition,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    },

    bulkUpdateTasks: (
      state,
      action: PayloadAction<{
        taskIds: string[];
        updates: Partial<Pick<Task, "status" | "priority">>;
      }>
    ) => {
      const { taskIds, updates } = action.payload;

      if (updates.priority) {
        const tasksInDestPriority = state.items.filter(
          (t) => t.priority === updates.priority
        );
        let nextPosition = tasksInDestPriority.length
          ? Math.max(...tasksInDestPriority.map((t) => t.position || 0)) + 1
          : 0;

        state.items = state.items.map((task) => {
          if (taskIds.includes(task.id)) {
            const needsNewPosition =
              updates.priority && task.priority !== updates.priority;

            return {
              ...task,
              ...updates,
              position: needsNewPosition ? nextPosition++ : task.position || 0,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });
      } else {
        state.items = state.items.map((task) => {
          if (taskIds.includes(task.id)) {
            return {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });
      }
    },

    reorderTasks: (state, action: PayloadAction<ReorderTasksPayload>) => {
      const { priority, taskIds } = action.payload;

      taskIds.forEach((taskId, index) => {
        const taskIndex = state.items.findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          state.items[taskIndex] = {
            ...state.items[taskIndex],
            position: index,
            updatedAt: new Date().toISOString(),
          };
        }
      });
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  deleteTasks,
  updateTaskPriority,
  reorderTasks,
  bulkUpdateTasks,
} = tasksSlice.actions;

export default tasksSlice.reducer;

export const selectAllTasks = (state: any) => state.tasks.present.items;
