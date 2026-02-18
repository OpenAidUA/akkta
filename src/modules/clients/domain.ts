import { z } from 'zod';

export const ClientSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  edrpou: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Невірний формат email').optional().or(z.literal('')),
});

/** @deprecated Use ClientSchema instead */
export const CreateClientSchema = ClientSchema;

export type CreateClientRequest = z.infer<typeof ClientSchema>;
export type UpdateClientRequest = z.infer<typeof ClientSchema>;
