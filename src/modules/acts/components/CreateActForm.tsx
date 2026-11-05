'use client';

import { ArrowLeft, ArrowRight, Save, WifiOff } from 'react-feather';
import { twMerge } from 'tailwind-merge';

import { Button } from '@/shared/ui/button';
import { useCreateActForm } from '@/modules/acts/hooks/use-create-act-form';
import type { ActItemInput } from '@/modules/acts/utils/form-defaults';
import FormAlert from '@/modules/acts/components/FormAlert';
import FormStepper from '@/modules/acts/components/FormStepper';
import StepMeta from '@/modules/acts/components/StepMeta';
import StepClient from '@/modules/acts/components/StepClient';
import StepItems from '@/modules/acts/components/StepItems';

export interface CreateActFormProps {
  clients: Array<{
    id: string;
    name: string;
    edrpou: string | null;
    phone: string | null;
    email: string | null;
  }>;
  contractor: {
    name: string;
    representative: string;
  };
  /** Pre-fills the act's project association, e.g. when created from a project page. */
  project?: {
    id: string;
    name: string;
  };

  initialItems?: ActItemInput[];
}

export default function CreateActForm({
  clients,
  contractor,
  project,
  initialItems,
}: CreateActFormProps) {
  const {
    form,
    currentStep,
    isLastStep,
    isOnline,
    isBusy,
    notice,
    prevStep,
    cancel,
    onFormSubmit,
  } = useCreateActForm({
    contractor,
    projectId: project?.id ?? null,
    initialItems,
  });

  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const stepProps = { register, errors, control, setValue, watch };

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Новий акт
        </h1>
        {project && (
          <p className="text-center text-sm text-slate-500 mb-4">
            Проєкт:{' '}
            <span className="font-medium text-slate-700">{project.name}</span>
          </p>
        )}
        <FormStepper currentStep={currentStep} />
      </div>

      <form
        onSubmit={onFormSubmit}
        noValidate
        aria-busy={isBusy}
        className="space-y-6"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-75 flex flex-col gap-6">
          <FormAlert notice={notice} />

          {/* Fieldset disables every input while the request is in flight */}
          <fieldset disabled={isBusy} className="contents">
            {currentStep === 0 && <StepMeta {...stepProps} />}
            {currentStep === 1 && (
              <StepClient {...stepProps} clients={clients} />
            )}
            {currentStep === 2 && <StepItems {...stepProps} />}
          </fieldset>

          <div className="mt-auto pt-8 flex justify-end gap-4">
            {currentStep === 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={cancel}
                disabled={isBusy}
                className="gap-2 text-md hover:bg-slate-100 text-slate-600 rounded-2xl"
              >
                Скасувати
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isBusy}
                className="gap-2 text-md hover:bg-slate-100 text-slate-600 rounded-2xl"
              >
                <ArrowLeft size={16} aria-hidden /> Назад
              </Button>
            )}

            {isLastStep ? (
              <Button
                key="save"
                type="submit"
                disabled={isBusy}
                className={twMerge(
                  'text-md w-fit gap-2 mx-0 px-16 text-white',
                  isOnline
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-amber-500 hover:bg-amber-600',
                )}
              >
                {isBusy ? (
                  'Збереження...'
                ) : isOnline ? (
                  <>
                    <Save size={16} aria-hidden /> Зберегти акт
                  </>
                ) : (
                  <>
                    <WifiOff size={16} aria-hidden /> Зберегти офлайн
                  </>
                )}
              </Button>
            ) : (
              <Button
                key="next"
                type="submit"
                className="bg-blue-600 text-md w-fit hover:bg-blue-700 text-white gap-2 mx-0 px-16"
              >
                Далі <ArrowRight size={16} aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
