'use client';

import { useActionState, startTransition, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label } from '@/components/ui';
import {
  Save,
  Briefcase,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
} from 'react-feather';
import {
  UpdateOrganizationSchema,
  type UpdateOrganizationRequest,
} from '@/modules/organizations/domain';
import { updateOrganizationAction } from './action';

export interface SettingsFormProps {
  defaultValues: UpdateOrganizationRequest;
}

export default function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [state, action, isPending] = useActionState(
    updateOrganizationAction,
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateOrganizationRequest>({
    resolver: zodResolver(UpdateOrganizationSchema),
    mode: 'onTouched',
    defaultValues,
  });

  // Reset form with new defaults when server confirms success
  const prevSuccess = useRef(false);
  useEffect(() => {
    if (state?.success && !prevSuccess.current) {
      prevSuccess.current = true;
    } else {
      prevSuccess.current = false;
    }
  }, [state]);

  const onSubmit = (data: UpdateOrganizationRequest) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.edrpou) formData.append('edrpou', data.edrpou);
      if (data.representative)
        formData.append('representative', data.representative);
      action(formData);
    });
  };

  const generalError =
    state?.message && state.message !== 'Validation failed' && !state.success
      ? state.message
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success banner */}
      {state?.success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          <CheckCircle size={16} className="shrink-0" />
          {state.message}
        </div>
      )}

      {/* General error */}
      {generalError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {generalError}
        </div>
      )}

      {/* ── Section: Реквізити ── */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 space-y-5">
        <div className="pb-2 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Briefcase size={16} className="text-blue-500" />
            Реквізити організації
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Назва та ЄДРПОУ виводяться у PDF-актах
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="flex items-center gap-2 text-slate-700"
          >
            <Briefcase size={15} className="text-slate-400" />
            Назва організації <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            placeholder="ФОП Іваненко Іван Іванович"
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
            <FileText size={15} className="text-slate-400" />
            ЄДРПОУ / ІПН{' '}
            <span className="text-slate-400 font-normal text-xs">
              (необов&apos;язково)
            </span>
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
        </div>
      </div>

      {/* ── Section: Підписант ── */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 space-y-5">
        <div className="pb-2 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Підписант
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ім&apos;я особи, яка підписує акти з вашого боку
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="representative"
            className="flex items-center gap-2 text-slate-700"
          >
            <User size={15} className="text-slate-400" />
            ПІБ або посада підписанта{' '}
            <span className="text-slate-400 font-normal text-xs">
              (необов&apos;язково)
            </span>
          </Label>
          <Input
            id="representative"
            placeholder="Директор Іваненко І.І."
            className={
              errors.representative || state?.errors?.representative
                ? 'border-red-400 focus-visible:ring-red-400/40'
                : ''
            }
            {...register('representative')}
          />
          {errors.representative && (
            <p className="text-red-500 text-xs">
              {errors.representative.message}
            </p>
          )}
          <p className="text-xs text-slate-400">
            Відображається у рядку «Виконавець» в PDF-акті
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8"
        >
          {isPending ? (
            'Збереження...'
          ) : (
            <>
              <Save size={16} />
              Зберегти зміни
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
