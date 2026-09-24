import { z } from 'zod';

export const ProjectSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
  plannedStartDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
  primaryClientId: z.string().optional(),
});

export type CreateProjectRequest = z.infer<typeof ProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof ProjectSchema>;

export const EstimateItemSchema = z.object({
  name: z.string().min(1, "Назва позиції обов'язкова"),
  unit: z.string().min(1, "Одиниця виміру обов'язкова"),
  quantity: z
    .number({ message: 'Кількість має бути числом' })
    .positive('Кількість має бути більше нуля'),
  price: z
    .number({ message: 'Ціна має бути числом' })
    .nonnegative('Ціна не може бути відʼємною'),
});

export const EstimateRevisionInputSchema = z.object({
  items: z.array(EstimateItemSchema).min(1, 'Додайте хоча б одну позицію'),
});

export type EstimateItemInput = z.infer<typeof EstimateItemSchema>;
export type EstimateRevisionInput = z.infer<typeof EstimateRevisionInputSchema>;
