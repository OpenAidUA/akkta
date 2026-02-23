import type {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { z } from 'zod';
import { CreateActRequestSchema } from '@/modules/acts/domain';

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
    fields: [
      'act.meta.number',
      'act.meta.date',
      'act.meta.city',
    ],
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
