import { z } from 'zod';

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  edrpou: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Невірний формат email').optional().or(z.literal('')),
});

export type CreateClientRequest = z.infer<typeof CreateClientSchema>;
