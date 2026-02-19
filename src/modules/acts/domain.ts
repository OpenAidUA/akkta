import { z } from 'zod';

export const ActItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  total: z.number().optional(),
});

export const ActTotalsSchema = z.object({
  subtotal: z.number(),
  total: z.number(),
  totalText: z.string(),
});

export const ActDocumentSchema = z.object({
  meta: z.object({
    number: z.string(),
    city: z.string().optional(),
    date: z.string(), // ISO
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
  items: z.array(ActItemSchema).min(1),
  contractRef: z.string().optional(),
  totals: ActTotalsSchema.optional(),
});

export type ActDocument = z.infer<typeof ActDocumentSchema>;

export const ClientSnapshotSchema = z.object({
  name: z.string(),
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
