import { z } from "zod/v4";

export const createDatasetSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/, {
      message:
        "Name must start with an alphanumeric character and can only contain alphanumeric characters, underscores (_), dots (.), or dashes (-).",
    })
    .min(1, { message: "Name is required" }),
  description: z.string().optional(),
  retentionDays: z
    .number()
    .int({ message: "Retention days must be a whole number" })
    .min(1, { message: "Retention days must be at least 1 day" })
    .max(365, { message: "Retention days cannot exceed 365 days" }), // Default max, will be overridden by component validation
});

// Function to create schema with dynamic max retention days
export const createDatasetSchemaWithMaxRetention = (maxRetentionDays: number) =>
  createDatasetSchema.extend({
    retentionDays: z
      .number()
      .int({ message: "Retention days must be a whole number" })
      .min(1, { message: "Retention days must be at least 1 day" })
      .max(maxRetentionDays, {
        message: `Retention days cannot exceed ${maxRetentionDays} days`,
      }),
  });

export const datasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  retentionDays: z.number(),
  organizationId: z.string(),
});

export type CreateDatasetSchema = z.infer<typeof createDatasetSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
