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

export const ProjectClientSnapshotSchema = z.object({
  name: z.string().min(1, "Вкажіть назву замовника"),
  edrpou: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email('Невірний формат email')
    .optional()
    .or(z.literal('')),
});

export type ProjectClientSnapshot = z.infer<typeof ProjectClientSnapshotSchema>;

export const ProjectDetailsSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  address: z.string().optional(),
  description: z.string().optional(),
  plannedStartDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
});

export type ProjectDetailsInput = z.infer<typeof ProjectDetailsSchema>;

export const ProjectClientInputSchema = z.object({
  id: z.string().uuid().nullable(),
  snapshot: ProjectClientSnapshotSchema,
  save: z.boolean(),
});

export type ProjectClientInput = z.infer<typeof ProjectClientInputSchema>;

export const CreateProjectWithClientSchema = z.object({
  project: ProjectDetailsSchema,
  client: ProjectClientInputSchema.nullable(),
});

export type CreateProjectWithClientRequest = z.infer<
  typeof CreateProjectWithClientSchema
>;


/**
 * Estimate items are grouped into five fixed sections mirroring the standard
 * cost-estimate structure:
 *  А (WORK)      — Роботи
 *  Б (MATERIAL)  — Матеріали та обладнання
 *  В (MACHINERY) — Машини та механізми
 *  Г (DELIVERY)  — Доставка та супутні послуги
 *  Д (TAX)       — Податки та обов'язкові платежі
 *
 * Only WORK items are carried over into an Act (acts document "роботи" only),
 * see createNextEstimateRevision usage in acts/create page.
 */
export const EstimateCategoryEnum = z.enum([
  'WORK',
  'MATERIAL',
  'MACHINERY',
  'DELIVERY',
  'TAX',
]);

export type EstimateCategory = z.infer<typeof EstimateCategoryEnum>;

export const ESTIMATE_CATEGORY_LABEL: Record<EstimateCategory, string> = {
  WORK: 'А. Роботи',
  MATERIAL: 'Б. Матеріали та обладнання',
  MACHINERY: 'В. Машини та механізми',
  DELIVERY: 'Г. Доставка та супутні послуги',
  TAX: "Д. Податки та обов'язкові платежі",
};

export const ESTIMATE_CATEGORY_CODE: Record<EstimateCategory, string> = {
  WORK: 'А',
  MATERIAL: 'Б',
  MACHINERY: 'В',
  DELIVERY: 'Г',
  TAX: 'Д',
};

export const ESTIMATE_CATEGORY_ORDER: EstimateCategory[] = [
  'WORK',
  'MATERIAL',
  'MACHINERY',
  'DELIVERY',
  'TAX',
];

export const EstimateItemSchema = z.object({
  category: EstimateCategoryEnum,
  name: z.string().min(1, "Назва позиції обов'язкова"),
  unit: z.string().min(1, "Одиниця виміру обов'язкова"),
  quantity: z
    .number({ message: 'Кількість має бути числом' })
    .positive('Кількість має бути більше нуля'),
  price: z
    .number({ message: 'Ціна має бути числом' })
    .nonnegative('Ціна не може бути відʼємною'),
  source: z.string().optional(),
  sourceDate: z.string().optional(),
  note: z.string().optional(),
});

export const EstimateRevisionInputSchema = z.object({
  items: z
    .array(EstimateItemSchema)
    .min(1, 'Додайте хоча б одну позицію')
    .max(500, 'Забагато позицій у кошторисі (максимум 500)'),
});

export type EstimateItemInput = z.infer<typeof EstimateItemSchema>;
export type EstimateRevisionInput = z.infer<typeof EstimateRevisionInputSchema>;
