import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string(),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

export interface Organization {
  id: string;
  name: string;
}
