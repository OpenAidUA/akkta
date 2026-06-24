import { z } from 'zod';

// Item schema
export const ActItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative().min(0.01),
  total: z.number().optional(),
});

// Template reference (legal anchor)
export const TemplateRefSchema = z.object({
  id: z.string(),
  version: z.string(),
});

// Main ActDocument schema
export const ActDocumentSchema = z.object({
  id: z.string().uuid().optional(),

  meta: z.object({
    number: z.string(),
    city: z.string().optional(),
    date: z.string().datetime(),
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

  totals: z
    .object({
      subtotal: z.number(),
      total: z.number(),
      totalText: z.string(),
    })
    .optional(),

  contractRef: z.string().optional(),
  createdAt: z.string().optional(),
});

export type ActDocument = z.infer<typeof ActDocumentSchema>;
