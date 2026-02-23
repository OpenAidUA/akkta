'use client';

import { useActionState, startTransition } from 'react';
import { createClientAction } from '@/app/(app)/clients/create/action';
import { updateClientAction } from '@/app/(app)/clients/[id]/edit/action';
import { Button, Input, Label } from '@/components/ui';
import { Save, User, FileText, Phone, Mail } from 'react-feather';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ClientSchema,
  type CreateClientRequest,
} from '@/modules/clients/domain';

const initialState = {
  message: '',
  errors: {},
};

export interface ClientFormProps {
  mode?: 'create' | 'edit';
  clientId?: string;
  defaultValues?: Partial<CreateClientRequest>;
}

const ClientForm = ({
  mode = 'create',
  clientId,
  defaultValues,
}: ClientFormProps) => {
  const createAction = useActionState(createClientAction, initialState);
  const updateAction = useActionState(
    clientId ? updateClientAction.bind(null, clientId) : createClientAction,
    initialState,
  );

  const [state, action, isPending] =
    mode === 'edit' ? updateAction : createAction;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClientRequest>({
    resolver: zodResolver(ClientSchema),
    mode: 'onTouched',
    defaultValues,
  });

  const onSubmit = (data: CreateClientRequest) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.edrpou) formData.append('edrpou', data.edrpou);
      if (data.contactName) formData.append('contactName', data.contactName);
      if (data.phone) formData.append('phone', data.phone);
      if (data.email) formData.append('email', data.email);

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
          <User size={16} className="text-slate-400" /> Назва компанії або ПІБ
        </Label>
        <Input
          id="name"
          placeholder="ТОВ Успіх"
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
          htmlFor="edrpou"
          className="flex items-center gap-2 text-slate-700"
        >
          <FileText size={16} className="text-slate-400" /> ЄДРПОУ / ІПН
        </Label>
        <Input
          id="edrpou"
          placeholder="12345678"
          className={
            errors.edrpou || state?.errors?.edrpou
              ? 'border-red-400 focus-visible:ring-red-400/40'
              : ''
          }
          {...register('edrpou')}
        />
        {errors.edrpou && (
          <p className="text-red-500 text-xs">{errors.edrpou.message}</p>
        )}
        {!errors.edrpou && state?.errors?.edrpou && (
          <p className="text-red-500 text-xs">{state.errors.edrpou}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="contactName"
            className="flex items-center gap-2 text-slate-700"
          >
            <User size={16} className="text-slate-400" /> Контактна особа
          </Label>
          <Input
            id="contactName"
            placeholder="Іван Іванов"
            className={
              errors.contactName || state?.errors?.contactName
                ? 'border-red-400 focus-visible:ring-red-400/40'
                : ''
            }
            {...register('contactName')}
          />
          {errors.contactName && (
            <p className="text-red-500 text-xs">{errors.contactName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="phone"
            className="flex items-center gap-2 text-slate-700"
          >
            <Phone size={16} className="text-slate-400" /> Телефон
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+380 50 000 00 00"
            className={
              errors.phone || state?.errors?.phone
                ? 'border-red-400 focus-visible:ring-red-400/40'
                : ''
            }
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="flex items-center gap-2 text-slate-700"
        >
          <Mail size={16} className="text-slate-400" /> Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="client@mail.com"
          className={
            errors.email || state?.errors?.email
              ? 'border-red-400 focus-visible:ring-red-400/40'
              : ''
          }
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email.message}</p>
        )}
        {!errors.email && state?.errors?.email && (
          <p className="text-red-500 text-xs">{state.errors.email}</p>
        )}
      </div>

      <div className="pt-6 flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2 px-8">
          {isPending ? (
            'Збереження...'
          ) : (
            <>
              <Save size={18} />{' '}
              {mode === 'edit' ? 'Оновити клієнта' : 'Зберегти клієнта'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
