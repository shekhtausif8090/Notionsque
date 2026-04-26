import { z } from "zod";

export const taskStatusSchema = z.enum([
  "not started",
  "in progress",
  "completed",
]);

export const taskPrioritySchema = z.enum([
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);

export const customFieldsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  status: taskStatusSchema.optional().default("not started"),
  priority: taskPrioritySchema.optional().default("none"),
  customFields: customFieldsSchema.optional().default({}),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    position: z.number().int().nonnegative().optional(),
    destinationIndex: z.number().int().nonnegative().optional(),
    customFields: customFieldsSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field required",
  });

export const bulkCreateSchema = z.object({
  tasks: z.array(createTaskSchema).min(1),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.uuid()).min(1),
  patch: z
    .object({
      status: taskStatusSchema.optional(),
      priority: taskPrioritySchema.optional(),
    })
    .refine((v) => v.status !== undefined || v.priority !== undefined, {
      message: "patch must contain status or priority",
    }),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.uuid()).min(1),
});

export const reorderSchema = z.object({
  priority: taskPrioritySchema,
  orderedIds: z.array(z.uuid()).min(1),
});

export const customFieldSchema = z
  .object({
    key: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  });

export const listQuerySchema = z.object({
  status: z.union([taskStatusSchema, z.literal("all")]).optional(),
  priority: z.union([taskPrioritySchema, z.literal("all")]).optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["title", "status", "priority", "createdAt", "updatedAt", "position"])
    .optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkCreateInput = z.infer<typeof bulkCreateSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
export type CustomFieldInput = z.infer<typeof customFieldSchema>;
