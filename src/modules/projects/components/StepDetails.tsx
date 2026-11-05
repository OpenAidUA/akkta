'use client';

import type { BaseSyntheticEvent } from 'react';
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { ArrowRight, Calendar, FileText, Home, MapPin } from 'react-feather';
import { twMerge } from 'tailwind-merge';

import { Button, Input } from '@/shared/ui';
import { FormField } from '@/shared/ui/form-field';
import type { ProjectDetailsInput } from '@/modules/projects/domain';

const TEXTAREA_CLASS =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 ease-in-out hover:border-slate-300 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/50';

interface ProjectStepDetailsProps {
  register: UseFormRegister<ProjectDetailsInput>;
  control: Control<ProjectDetailsInput>;
  errors: FieldErrors<ProjectDetailsInput>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectStepDetails({
  register,
  control,
  errors,
  onSubmit,
  onCancel,
}: ProjectStepDetailsProps) {
  // Subscribes only this component to the start date (not the whole wizard).
  const startDate = useWatch({ control, name: 'plannedStartDate' });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <FormField
        label="Назва об'єкту"
        icon={<Home size={16} className="text-slate-400" aria-hidden />}
        error={errors.name?.message}
        required
      >
        {(field) => (
          <Input
            {...field}
            placeholder="Будинок на вул. Шевченка, 12"
            autoComplete="off"
            {...register('name')}
          />
        )}
      </FormField>

      <FormField
        label="Адреса"
        icon={<MapPin size={16} className="text-slate-400" aria-hidden />}
        error={errors.address?.message}
        optional
      >
        {(field) => (
          <Input
            {...field}
            placeholder="м. Київ, вул. Шевченка, 12"
            autoComplete="off"
            {...register('address')}
          />
        )}
      </FormField>

      <FormField
        label="Опис робіт"
        icon={<FileText size={16} className="text-slate-400" aria-hidden />}
        error={errors.description?.message}
        optional
      >
        {(field) => (
          <textarea
            {...field}
            rows={3}
            placeholder="Короткий опис обсягу робіт"
            className={twMerge(TEXTAREA_CLASS, field.className)}
            {...register('description')}
          />
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
        <FormField
          label="Плановий початок"
          icon={<Calendar size={16} className="text-slate-400" aria-hidden />}
          error={errors.plannedStartDate?.message}
          optional
        >
          {(field) => (
            <Input {...field} type="date" {...register('plannedStartDate')} />
          )}
        </FormField>

        <FormField
          label="Плановий фініш"
          icon={<Calendar size={16} className="text-slate-400" aria-hidden />}
          error={errors.plannedEndDate?.message}
          optional
        >
          {(field) => (
            <Input
              {...field}
              type="date"
              min={startDate || undefined}
              {...register('plannedEndDate')}
            />
          )}
        </FormField>
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-slate-600"
        >
          Скасувати
        </Button>
        <Button
          type="submit"
          className="mx-0 w-fit gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Далі <ArrowRight size={16} aria-hidden />
        </Button>
      </div>
    </form>
  );
}
