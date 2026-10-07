'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { twMerge } from 'tailwind-merge';
import {
  Save,
  Home,
  MapPin,
  FileText,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'react-feather';
import Link from 'next/link';
import { Button, Input, Label } from '@/shared/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { createProjectWithClientAction } from '@/modules/projects/actions';
import {
  ProjectDetailsSchema,
  ProjectClientSnapshotSchema,
  type ProjectDetailsInput,
  type ProjectClientSnapshot,
} from '@/modules/projects/domain';

export interface CreateProjectFormClientOption {
  id: string;
  name: string;
  edrpou: string | null;
  phone: string | null;
  email: string | null;
}

interface CreateProjectFormProps {
  clients: CreateProjectFormClientOption[];
}

const WIZARD_STEPS = [
  { id: 0, title: 'Проєкт' },
  { id: 1, title: 'Замовник' },
] as const;

const emptyClientSnapshot: ProjectClientSnapshot = {
  name: '',
  edrpou: '',
  contactName: '',
  phone: '',
  email: '',
};

export default function CreateProjectForm({ clients }: CreateProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Step 1: project details
  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    formState: { errors: projectErrors },
  } = useForm<ProjectDetailsInput>({
    resolver: zodResolver(ProjectDetailsSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      address: '',
      description: '',
      plannedStartDate: '',
      plannedEndDate: '',
    },
  });
  const [projectDetails, setProjectDetails] =
    useState<ProjectDetailsInput | null>(null);

  // Step 2: client
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [saveNewClient, setSaveNewClient] = useState(true);
  const [skipClient, setSkipClient] = useState(false);
  const {
    register: registerClient,
    handleSubmit: handleSubmitClient,
    reset: resetClient,
    formState: { errors: clientErrors },
  } = useForm<ProjectClientSnapshot>({
    resolver: zodResolver(ProjectClientSnapshotSchema),
    mode: 'onTouched',
    defaultValues: emptyClientSnapshot,
  });

  const handleSelectClient = (value: string) => {
    if (value === '__new__') {
      setSelectedClientId(null);
      setSkipClient(false);
      resetClient(emptyClientSnapshot);
      setSaveNewClient(true);
    } else if (value === '__skip__') {
      setSelectedClientId(null);
      setSkipClient(true);
    } else {
      setSelectedClientId(value);
      setSkipClient(false);
      const client = clients.find((c) => c.id === value);
      if (client) {
        resetClient({
          name: client.name,
          edrpou: client.edrpou ?? '',
          contactName: '',
          phone: client.phone ?? '',
          email: client.email ?? '',
        });
      }
    }
  };

  const goToClientStep = handleSubmitProject((data) => {
    setProjectDetails(data);
    setCurrentStep(1);
  });

  const goBackToProjectStep = () => {
    setCurrentStep(0);
  };

  const onFinalSubmit = handleSubmitClient((clientSnapshot) => {
    if (!projectDetails) return;
    setGeneralError(null);

    startTransition(async () => {
      const result = await createProjectWithClientAction({
        project: projectDetails,
        client: skipClient
          ? null
          : {
              id: selectedClientId,
              snapshot: clientSnapshot,
              save: selectedClientId ? false : saveNewClient,
            },
      });
      if (result?.message) {
        setGeneralError(result.message);
      }
    });
  });

  const isNewClient = !selectedClientId && !skipClient;

  return (
    <div className="space-y-6">
      <div className="flex w-1/2 mx-auto items-center gap-0">
        {WIZARD_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-initial"
            >
              <div className="flex items-center gap-2">
                <div
                  className={twMerge(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ring-4',
                    isCompleted
                      ? 'bg-blue-600 text-white ring-blue-100'
                      : isActive
                        ? 'bg-blue-600 text-white ring-blue-100 shadow-lg shadow-blue-600/30'
                        : 'bg-slate-100 text-slate-400 ring-white',
                  )}
                >
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>
                <span
                  className={twMerge(
                    'text-xs font-medium whitespace-nowrap',
                    isActive
                      ? 'text-blue-600'
                      : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400',
                  )}
                >
                  {step.title}
                </span>
              </div>
              {idx < WIZARD_STEPS.length - 1 && (
                <div
                  className={twMerge(
                    'flex-1 h-0.5 mx-3',
                    isCompleted ? 'bg-blue-600' : 'bg-slate-100',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {generalError && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
        {currentStep === 0 && (
          <form onSubmit={goToClientStep} className="space-y-6">
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
                  projectErrors.name
                    ? 'border-red-400 focus-visible:ring-red-400/40'
                    : ''
                }
                {...registerProject('name')}
              />
              {projectErrors.name && (
                <p className="text-red-500 text-xs">
                  {projectErrors.name.message}
                </p>
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
                {...registerProject('address')}
              />
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
                {...registerProject('description')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="plannedStartDate"
                  className="flex items-center gap-2 text-slate-700"
                >
                  <Calendar size={16} className="text-slate-400" /> Плановий
                  початок
                </Label>
                <Input
                  id="plannedStartDate"
                  type="date"
                  {...registerProject('plannedStartDate')}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="plannedEndDate"
                  className="flex items-center gap-2 text-slate-700"
                >
                  <Calendar size={16} className="text-slate-400" /> Плановий
                  фініш
                </Label>
                <Input
                  id="plannedEndDate"
                  type="date"
                  {...registerProject('plannedEndDate')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <Link href="/projects">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-600"
                >
                  Скасувати
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 w-fit mx-0 hover:bg-blue-700 text-white gap-2"
              >
                Далі <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        )}

        {currentStep === 1 && (
          <form onSubmit={onFinalSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Замовник
              </Label>
              <Select
                value={
                  skipClient ? '__skip__' : (selectedClientId ?? '__new__')
                }
                onValueChange={handleSelectClient}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Оберіть замовника" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">➕ Новий замовник</SelectItem>
                  <SelectItem value="__skip__">Без замовника</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}{' '}
                      {client.edrpou ? `(ЄДРПОУ: ${client.edrpou})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!skipClient && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    Назва замовника <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    className={
                      clientErrors.name
                        ? 'border-red-400 focus-visible:ring-red-400/40'
                        : ''
                    }
                    placeholder="Назва компанії або ФОП"
                    disabled={!!selectedClientId}
                    {...registerClient('name')}
                  />
                  {clientErrors.name && (
                    <p className="text-red-500 text-xs">
                      {clientErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">
                      ЄДРПОУ / ІПН{' '}
                      <span className="text-slate-400 font-normal">
                        (необов&apos;язково)
                      </span>
                    </Label>
                    <Input
                      placeholder="12345678"
                      disabled={!!selectedClientId}
                      {...registerClient('edrpou')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">
                      Контактна особа{' '}
                      <span className="text-slate-400 font-normal">
                        (необов&apos;язково)
                      </span>
                    </Label>
                    <Input
                      placeholder="Ім'я контактної особи"
                      disabled={!!selectedClientId}
                      {...registerClient('contactName')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">
                      Телефон{' '}
                      <span className="text-slate-400 font-normal">
                        (необов&apos;язково)
                      </span>
                    </Label>
                    <Input
                      placeholder="+380..."
                      disabled={!!selectedClientId}
                      {...registerClient('phone')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">
                      Email{' '}
                      <span className="text-slate-400 font-normal">
                        (необов&apos;язково)
                      </span>
                    </Label>
                    <Input
                      placeholder="email@example.com"
                      disabled={!!selectedClientId}
                      {...registerClient('email')}
                    />
                    {clientErrors.email && (
                      <p className="text-red-500 text-xs">
                        {clientErrors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {isNewClient && (
                  <label className="flex items-center gap-3 cursor-pointer group pt-2 border-t border-slate-100">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={saveNewClient}
                        onChange={(e) => setSaveNewClient(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 shadow-sm transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400"
                      />
                      <Check
                        size={14}
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                      Зберегти цього замовника в базу
                    </span>
                  </label>
                )}
              </>
            )}

            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={goBackToProjectStep}
                disabled={isPending}
                className="gap-2 text-slate-600"
              >
                <ArrowLeft size={16} /> Назад
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 w-fit mx-0 hover:bg-blue-700 text-white gap-2"
              >
                <Save size={16} />
                {isPending ? 'Збереження...' : 'Створити проєкт'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
