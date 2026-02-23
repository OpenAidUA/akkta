import { z } from 'zod';

export const ActItemSchema = z.object({
  title: z.string().min(1, 'Вкажіть назву послуги'),
  description: z.string().optional(),
  quantity: z
    .number({ error: 'Вкажіть кількість' })
    .positive('Кількість має бути більше 0'),
  unitPrice: z
    .number({ error: 'Вкажіть ціну' })
    .nonnegative('Ціна не може бути від\'ємною'),
  total: z.number().optional(),
});

export const ActTotalsSchema = z.object({
  subtotal: z.number(),
  total: z.number(),
  totalText: z.string(),
});

export const ActDocumentSchema = z.object({
  meta: z.object({
    number: z.string().min(1, 'Вкажіть номер акту'),
    city: z.string().min(1, 'Вкажіть місто'),
    date: z.string().min(1, 'Вкажіть дату'),
  }),
  parties: z.object({
    client: z.object({
      name: z.string(),
      representative: z.string().optional(),
    }),
    contractor: z.object({
      name: z.string(),
      representative: z.string(),
    }),
  }),
  items: z.array(ActItemSchema).min(1, 'Додайте хоча б одну послугу'),
  contractRef: z.string().optional(),
  totals: ActTotalsSchema.optional(),
});

export type ActDocument = z.infer<typeof ActDocumentSchema>;

export const ClientSnapshotSchema = z.object({
  name: z.string().min(1, 'Вкажіть назву клієнта'),
  edrpou: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export type ClientSnapshot = z.infer<typeof ClientSnapshotSchema>;

export const CreateActRequestSchema = z.object({
  act: ActDocumentSchema,
  client: z.object({
    id: z.string().uuid().nullable(),
    snapshot: ClientSnapshotSchema,
    save: z.boolean(),
  }),
});

export type CreateActRequest = z.infer<typeof CreateActRequestSchema>;
