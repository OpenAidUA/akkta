'use client';

import { useForm, type FieldErrors, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, WifiOff } from 'react-feather';
import Link from 'next/link';
import { useTransition, useState, useEffect } from 'react';
import { createActAction } from '../../../app/(app)/acts/create/action';
import { CreateActRequestSchema } from '@/modules/acts/domain';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { ActStorage } from '@/modules/acts/storage';

import {
  type ActFormValues,
  STEPS,
} from '../../../app/(app)/acts/create/types';
import FormStepper from '../../widgets/acts/FormStepper';
import StepMeta from '../../widgets/acts/StepMeta';
import StepClient from '../../widgets/acts/StepClient';
import StepItems from '../../widgets/acts/StepItems';

const defaultValues: Partial<ActFormValues> = {
  act: {
    meta: {
      number: '',
      date: new Date().toISOString().split('T')[0],
      city: 'Київ',
    },
    items: [
      {
        title: 'Послуги з розробки програмного забезпечення',
        quantity: 1,
        unitPrice: 0,
      },
    ],
    parties: {
      contractor: { name: 'My Organization', representative: 'Director' },
      client: { name: '' },
    },
  },
  client: {
    id: null,
    save: true,
    snapshot: {
      name: '',
      phone: '',
      email: '',
    },
  },
};

export interface CreateActFormProps {
  clients: Array<{
    id: string;
    name: string;
    edrpou: string | null;
    phone: string | null;
    email: string | null;
  }>;
}

export default function CreateActForm({ clients }: CreateActFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);

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
    mode: 'onBlur',
  });

  const clientName = watch('client.snapshot.name');

  useEffect(() => {
    setValue('act.parties.client.name', clientName || '');
  }, [clientName, setValue]);

  const isOnline = useNetworkStatus();

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
    if (!isOnline) {
      try {
        ActStorage.save(data);
        alert(
          'Інтернет відсутній. Акт збережено як локальну чернетку. Ви зможете синхронізувати його пізніше на головній сторінці.',
        );
        router.push('/acts');
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : 'Невідома помилка');
      }
      return;
    }

    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 500));
      const result = await createActAction(null, data);
      if (result?.errors) {
        console.error(result.errors);
        alert('Помилка валідації. Перевірте поля.');
      } else if (result?.message) {
        alert(result.message);
        router.push('/acts');
      }
    });
  };

  const onError = (errors: FieldErrors<ActFormValues>) => {
    console.error('Form errors:', errors);
    alert('Будь ласка, перевірте правильність заповнення всіх полів.');
  };

  const stepProps = { register, errors, control, setValue, watch };

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      {/* Header & Progress */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Новий акт
        </h1>
        <FormStepper currentStep={currentStep} />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-75 flex flex-col">
          {currentStep === 0 && <StepMeta {...stepProps} />}
          {currentStep === 1 && <StepClient {...stepProps} clients={clients} />}
          {currentStep === 2 && <StepItems {...stepProps} />}

          {/* FOOTER ACTIONS */}
          <div className="mt-auto pt-8 flex justify-end gap-4">
            {currentStep === 0 ? (
              <Link href="/acts">
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
                  'bg-blue-600 text-md w-fit hover:bg-blue-700 text-white gap-2 mx-0 px-16',
                  isOnline
                    ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
                )}
              >
                {isPending ? (
                  'Збереження...'
                ) : (
                  <>
                    {isOnline ? <Save size={16} /> : <WifiOff size={16} />}
                    {isOnline ? 'Зберегти акт' : 'Зберегти офлайн'}
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
