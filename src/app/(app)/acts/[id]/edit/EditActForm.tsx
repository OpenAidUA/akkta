'use client';

import {
  useForm,
  useWatch,
  type FieldErrors,
  type FieldPath,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save } from 'react-feather';
import Link from 'next/link';
import { useTransition, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { CreateActRequestSchema } from '@/modules/acts/domain';
import { updateActAction } from './action';

import { type ActFormValues, STEPS } from '../../create/types';
import FormStepper from '../../../../../components/widgets/acts/FormStepper';
import StepMeta from '../../../../../components/widgets/acts/StepMeta';
import StepClient from '../../../../../components/widgets/acts/StepClient';
import StepItems from '../../../../../components/widgets/acts/StepItems';
import { useState } from 'react';
import type { ActWithClient } from '@/modules/acts/types';

export interface EditActFormProps {
  act: ActWithClient;
  clients: Array<{
    id: string;
    name: string;
    edrpou: string | null;
    phone: string | null;
    email: string | null;
  }>;
}

export default function EditActForm({ act, clients }: EditActFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);

  const defaultValues: ActFormValues = {
    act: act.data,
    client: {
      id: act.clientId ?? null,
      snapshot: act.clientSnapshot,
      save: false,
    },
  };

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ActFormValues>({
    resolver: zodResolver(CreateActRequestSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const clientName = useWatch({
    control,
    name: 'client.snapshot.name',
  });

  useEffect(() => {
    setValue('act.parties.client.name', clientName || '');
  }, [clientName, setValue]);

  const nextStep = async () => {
    const fieldsToValidate = STEPS[currentStep]
      .fields as unknown as FieldPath<ActFormValues>[];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data: ActFormValues) => {
    startTransition(async () => {
      const result = await updateActAction(act.id, data);
      if (result?.errors) {
        console.error(result.errors);
        alert('Помилка валідації. Перевірте поля.');
      } else if (result?.message) {
        alert(result.message);
      }
    });
  };

  const onError = (errs: FieldErrors<ActFormValues>) => {
    console.error('Form errors:', errs);
    alert('Будь ласка, перевірте правильність заповнення всіх полів.');
  };

  const stepProps = { register, errors, control, setValue, watch };

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Редагувати акт
        </h1>
        {act.status !== 'draft' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            ⚠️ Після збереження PDF стане недійсним — акт повернеться до статусу
            «Чернетка».
          </div>
        )}
        <FormStepper currentStep={currentStep} />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-75 flex flex-col">
          {currentStep === 0 && <StepMeta {...stepProps} />}
          {currentStep === 1 && <StepClient {...stepProps} clients={clients} />}
          {currentStep === 2 && <StepItems {...stepProps} />}

          {/* Footer actions */}
          <div className="mt-auto pt-8 flex justify-end gap-4">
            {currentStep === 0 ? (
              <Link href={`/acts/${act.id}`}>
                <Button
                  variant="ghost"
                  className="gap-2 text-md hover:bg-slate-100 text-slate-600 rounded-2xl"
                >
                  Скасувати
                </Button>
              </Link>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isPending}
                className="gap-2 text-md hover:bg-slate-100 text-slate-600 rounded-2xl"
              >
                <ArrowLeft size={16} /> Назад
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-md w-fit hover:bg-blue-700 text-white gap-2 mx-0 px-16"
              >
                Далі <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => handleSubmit(onSubmit, onError)()}
                disabled={isPending}
                className={twMerge(
                  'bg-green-600 text-md w-fit hover:bg-green-700 text-white gap-2 mx-0 px-16',
                )}
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
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
