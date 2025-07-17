import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

export interface Organization {
  id: string;
  name: string;
}
