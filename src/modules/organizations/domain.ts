import { z } from 'zod';

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, "Назва організації обов'язкова"),
  edrpou: z.string().optional().or(z.literal('')),
  representative: z.string().optional().or(z.literal('')),
});

export type UpdateOrganizationRequest = z.infer<
  typeof UpdateOrganizationSchema
>;
