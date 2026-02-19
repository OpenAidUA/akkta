'use client';

import {
  useFieldArray,
  useForm,
  type FieldErrors,
  type FieldPath,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  WifiOff,
} from 'react-feather';
import Link from 'next/link';
import { useTransition, useState, useEffect } from 'react';
import { createActAction } from './action';
import { CreateActRequestSchema } from '@/modules/acts/domain';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { ActStorage } from '@/modules/acts/storage';

// We can extend the schema or use it directly.
// For the UI, we might want defaults.
type ActFormValues = z.infer<typeof CreateActRequestSchema>;

const defaultValues: Partial<ActFormValues> = {
  act: {
    meta: {
      number: '',
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD for input type=date
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

const STEPS = [
  {
    id: 0,
    title: 'Основне',
    fields: ['act.meta.number', 'act.meta.date', 'act.meta.city'],
  },
  { id: 1, title: 'Клієнт', fields: ['client.snapshot.name'] },
  { id: 2, title: 'Послуги', fields: ['act.items'] },
];

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'act.items',
  });

  const isOnline = useNetworkStatus();

  const nextStep = async () => {
    const fieldsToValidate = STEPS[currentStep]
      .fields as FieldPath<ActFormValues>[];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data: ActFormValues) => {
    // If Offline - save to local storage
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

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClientId = e.target.value;
    if (selectedClientId === 'new') {
      setValue('client.id', null);
      setValue('client.snapshot.name', '');
      setValue('client.snapshot.edrpou', '');
      setValue('client.save', true);
    } else {
      const selectedClient = clients.find((c) => c.id === selectedClientId);
      if (selectedClient) {
        setValue('client.id', selectedClient.id);
        setValue('client.snapshot.name', selectedClient.name);
        setValue('client.snapshot.edrpou', selectedClient.edrpou || '');
        setValue('client.save', false); // Already saved
      }
    }
  };

  const selectedClientId = watch('client.id');

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      {/* Header & Progress */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Новий акт</h1>
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={twMerge(
                  'w-2.5 h-2.5 rounded-full transition-colors duration-300',
                  idx === currentStep
                    ? 'bg-blue-600 scale-125'
                    : idx < currentStep
                      ? 'bg-blue-400'
                      : 'bg-slate-200',
                )}
              />
              {idx !== STEPS.length - 1 && (
                <div
                  className={twMerge(
                    'w-8 h-0.5 mx-1 transition-colors duration-300',
                    idx < currentStep ? 'bg-blue-400' : 'bg-slate-200',
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <h2 className="text-lg font-medium text-slate-600">
          {STEPS[currentStep].title} {currentStep + 1} з {STEPS.length}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[300px] flex flex-col">
          {/* STEP 1: META */}
          {currentStep === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Номер акту
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-lg"
                  placeholder="№ 1"
                  autoFocus
                  {...register('act.meta.number')}
                />
                {errors.act?.meta?.number && (
                  <p className="text-red-500 text-xs">
                    {errors.act.meta.number.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Дата
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    {...register('act.meta.date')}
                  />
                  {errors.act?.meta?.date && (
                    <p className="text-red-500 text-xs">
                      {errors.act.meta.date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Місто
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="Київ"
                    {...register('act.meta.city')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CLIENT */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Client Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Оберіть клієнта
                </label>
                <select
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                  onChange={handleClientSelect}
                  value={selectedClientId || 'new'}
                >
                  <option value="new">➕ Новий клієнт</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.edrpou ? `(ЄДРПОУ: ${c.edrpou})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative border-t border-slate-100 my-4">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-400">
                  АБО ЗАПОВНІТЬ ВРУЧНУ
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Хто клієнт?
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-lg"
                  placeholder="Назва компанії або ФОП"
                  {...register('client.snapshot.name')}
                  disabled={!!selectedClientId}
                />
                {errors.client?.snapshot?.name && (
                  <p className="text-red-500 text-xs">
                    {errors.client.snapshot.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  ЄДРПОУ / ІПН{' '}
                  <span className="text-slate-400 font-normal">
                    (необов&apos;язково)
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="12345678"
                  {...register('client.snapshot.edrpou')}
                  disabled={!!selectedClientId}
                />
              </div>

              {!selectedClientId && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 shadow-sm transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400"
                        {...register('client.save')}
                      />
                      <Check
                        size={14}
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                      Зберегти цього клієнта в базу
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: ITEMS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 -mr-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 bg-slate-50 rounded-xl relative group border border-slate-100"
                  >
                    <div className="mb-3">
                      <input
                        type="text"
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 p-0 text-sm font-medium focus:ring-0 placeholder:text-slate-400"
                        placeholder="Опис послуги чи товару"
                        {...register(`act.items.${index}.title` as const)}
                      />
                      {errors.act?.items?.[index]?.title && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.act.items[index].title.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Кількість
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full bg-white px-2 py-1.5 rounded-md border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                          {...register(`act.items.${index}.quantity` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Ціна (грн)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full bg-white px-2 py-1.5 rounded-md border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                          {...register(
                            `act.items.${index}.unitPrice` as const,
                            {
                              valueAsNumber: true,
                            },
                          )}
                        />
                      </div>
                    </div>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ title: '', quantity: 1, unitPrice: 0 })}
                className="w-full border-dashed"
              >
                <Plus size={16} className="mr-2" /> Додати позицію
              </Button>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-auto pt-8 flex justify-between gap-4">
            {currentStep === 0 ? (
              <Link href="/acts">
                <Button variant="ghost" className="text-slate-400">
                  Скасувати
                </Button>
              </Link>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isPending}
                className="gap-2"
              >
                <ArrowLeft size={16} /> Назад
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 ml-auto px-8"
              >
                Далі <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className={twMerge(
                  'text-white gap-2 ml-auto px-8 shadow-lg transition-all',
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
