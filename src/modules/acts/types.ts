import type {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { z } from 'zod';

import type { Act, Client } from '@prisma/client';
import type { ActDocument, ClientSnapshot } from './domain';
import { CreateActRequestSchema } from '@/modules/acts/domain';

/** Act row with JSON fields properly typed and the client relation included. */
export type ActWithClient = Omit<Act, 'data' | 'clientSnapshot'> & {
  data: ActDocument;
  clientSnapshot: ClientSnapshot;
  client: Client | null;
};

export type ActFormValues = z.infer<typeof CreateActRequestSchema>;

export interface StepProps {
  register: UseFormRegister<ActFormValues>;
  errors: FieldErrors<ActFormValues>;
  control: Control<ActFormValues>;
  setValue: UseFormSetValue<ActFormValues>;
  watch: UseFormWatch<ActFormValues>;
}

export const STEPS = [
  {
    id: 0,
    title: 'Основне',
    fields: ['act.meta.number', 'act.meta.date', 'act.meta.city'],
  },
  {
    id: 1,
    title: 'Клієнт',
    fields: ['client.snapshot.name'],
  },
  {
    id: 2,
    title: 'Послуги',
    fields: ['act.items'],
  },
] as const;
