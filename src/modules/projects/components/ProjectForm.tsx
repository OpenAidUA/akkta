'use client';

import { useActionState, startTransition } from 'react';
import {
  createProjectAction,
  updateProjectAction,
} from '@/modules/projects/actions';
import { Button, Input, Label } from '@/shared/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Save, Home, MapPin, FileText, Calendar, Users } from 'react-feather';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProjectSchema,
  type CreateProjectRequest,
} from '@/modules/projects/domain';

const initialState = {
  message: '',
  errors: {},
};

export interface ProjectFormClientOption {
  id: string;
  name: string;
}

type ProjectFormProps = (
  | {
      mode?: 'create';
      projectId?: never;
    }
  | {
      mode: 'edit';
      projectId: string;
    }
) & {
  defaultValues?: Partial<CreateProjectRequest>;
  clients: ProjectFormClientOption[];
};

const NO_CLIENT_VALUE = '__none__';

export default function ProjectForm(props: ProjectFormProps) {
  const { defaultValues, clients } = props;
  const projectAction =
    props.mode === 'edit'
      ? updateProjectAction.bind(null, props.projectId)
      : createProjectAction;
  const [state, action, isPending] = useActionState(
    projectAction,
    initialState,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateProjectRequest>({
    resolver: zodResolver(ProjectSchema),
    mode: 'onTouched',
    defaultValues,
  });

  const onSubmit = (data: CreateProjectRequest) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.address) formData.append('address', data.address);
      if (data.description) formData.append('description', data.description);
      if (data.plannedStartDate)
        formData.append('plannedStartDate', data.plannedStartDate);
      if (data.plannedEndDate)
        formData.append('plannedEndDate', data.plannedEndDate);
      if (data.primaryClientId)
        formData.append('primaryClientId', data.primaryClientId);

      action(formData);
    });
  };

  const generalError =
    state?.message && state.message !== 'Validation failed'
      ? state.message
      : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      {generalError && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="name"
          className="flex items-center gap-2 text-slate-700"
        >
          <Home size={16} className="text-slate-400" /> Назва об&apos;єкту
        </Label>
        <Input
          id="name"
          placeholder="Будинок на вул. Шевченка, 12"
          className={
            errors.name || state?.errors?.name
              ? 'border-red-400 focus-visible:ring-red-400/40'
              : ''
          }
          {...register('name')}
        />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name.message}</p>
        )}
        {!errors.name && state?.errors?.name && (
          <p className="text-red-500 text-xs">{state.errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="address"
          className="flex items-center gap-2 text-slate-700"
        >
          <MapPin size={16} className="text-slate-400" /> Адреса
        </Label>
        <Input
          id="address"
          placeholder="м. Київ, вул. Шевченка, 12"
          className={
            errors.address || state?.errors?.address
              ? 'border-red-400 focus-visible:ring-red-400/40'
              : ''
          }
          {...register('address')}
        />
        {errors.address && (
          <p className="text-red-500 text-xs">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="description"
          className="flex items-center gap-2 text-slate-700"
        >
          <FileText size={16} className="text-slate-400" /> Опис робіт
        </Label>
        <textarea
          id="description"
          placeholder="Короткий опис обсягу робіт"
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 ease-in-out focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-400/50 focus:bg-white hover:border-slate-300"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-red-500 text-xs">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="primaryClientId"
          className="flex items-center gap-2 text-slate-700"
        >
          <Users size={16} className="text-slate-400" /> Замовник
        </Label>
        <Controller
          name="primaryClientId"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              value={value || NO_CLIENT_VALUE}
              onValueChange={(v) =>
                onChange(v === NO_CLIENT_VALUE ? undefined : v)
              }
            >
              <SelectTrigger id="primaryClientId" className="w-full">
                <SelectValue placeholder="Оберіть замовника" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLIENT_VALUE}>Без замовника</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.primaryClientId && (
          <p className="text-red-500 text-xs">
            {errors.primaryClientId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="plannedStartDate"
            className="flex items-center gap-2 text-slate-700"
          >
            <Calendar size={16} className="text-slate-400" /> Плановий початок
          </Label>
          <Input
            id="plannedStartDate"
            type="date"
            className={
              errors.plannedStartDate || state?.errors?.plannedStartDate
                ? 'border-red-400 focus-visible:ring-red-400/40'
                : ''
            }
            {...register('plannedStartDate')}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="plannedEndDate"
            className="flex items-center gap-2 text-slate-700"
          >
            <Calendar size={16} className="text-slate-400" /> Плановий фініш
          </Label>
          <Input
            id="plannedEndDate"
            type="date"
            className={
              errors.plannedEndDate || state?.errors?.plannedEndDate
                ? 'border-red-400 focus-visible:ring-red-400/40'
                : ''
            }
            {...register('plannedEndDate')}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Save size={16} />
          {isPending
            ? 'Збереження...'
            : props.mode === 'edit'
              ? 'Зберегти зміни'
              : 'Створити проєкт'}
        </Button>
      </div>
    </form>
  );
}
