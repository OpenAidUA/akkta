'use client';

import { useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Check, Edit2 } from 'react-feather';
import Link from 'next/link';
import { Button, Input, Label } from '@/shared/ui';
import {
  agreeEstimateRevisionAction,
  createInitialEstimateRevisionAction,
  createNextEstimateRevisionAction,
} from '@/modules/projects/actions';
import {
  EstimateRevisionInputSchema,
  type EstimateRevisionInput,
} from '@/modules/projects/domain';

export interface EstimateItemView {
  name: string;
  unit: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface EstimateRevisionView {
  id: string;
  version: number;
  status: 'draft' | 'agreed';
  items: EstimateItemView[];
}

interface EstimateSectionProps {
  projectId: string;
  revision: EstimateRevisionView | null;
}

const emptyItem = { name: '', unit: '', quantity: 1, price: 0 };

function formatMoney(n: number) {
  return n.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function EstimateSection({ projectId, revision }: EstimateSectionProps) {
  const [isEditing, setIsEditing] = useState(!revision);
  const [isPending, startTransition] = useTransition();
  const [agreeError, setAgreeError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EstimateRevisionInput>({
    resolver: zodResolver(EstimateRevisionInputSchema),
    defaultValues: {
      items:
        revision && revision.items.length > 0
          ? revision.items.map((item) => ({
              name: item.name,
              unit: item.unit,
              quantity: item.quantity,
              price: item.price,
            }))
          : [emptyItem],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const [formState, setFormState] = useState<{
    errors?: Record<string, string[]>;
    message?: string;
  } | null>(null);

  const onSubmit = (data: EstimateRevisionInput) => {
    startTransition(async () => {
      const formData = new FormData();
      data.items.forEach((item) => {
        formData.append('itemName', item.name);
        formData.append('itemUnit', item.unit);
        formData.append('itemQuantity', String(item.quantity));
        formData.append('itemPrice', String(item.price));
      });

      const action = revision
        ? createNextEstimateRevisionAction
        : createInitialEstimateRevisionAction;
      const result = await action(projectId, null, formData);
      if (result?.message) {
        setFormState(result);
      } else {
        setIsEditing(false);
      }
    });
  };

  const handleAgree = () => {
    if (!revision) return;
    setAgreeError(null);
    startTransition(async () => {
      const result = await agreeEstimateRevisionAction(projectId, revision.id);
      if (result?.error) {
        setAgreeError(result.error);
      }
    });
  };

  const total = revision
    ? revision.items.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
      >
        {formState?.message && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {formState.message}
          </div>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 bg-slate-50 rounded-xl relative border border-slate-100"
            >
              <div className="mb-3">
                <Input
                  placeholder="Назва позиції *"
                  className="text-sm font-medium"
                  {...register(`items.${index}.name` as const)}
                />
                {errors.items?.[index]?.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.items[index]?.name?.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-24">
                  <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Одиниця
                  </Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="м2"
                    {...register(`items.${index}.unit` as const)}
                  />
                  {errors.items?.[index]?.unit && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.items[index]?.unit?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Кількість
                  </Label>
                  <Input
                    type="number"
                    step="0.001"
                    className="h-9 text-sm"
                    {...register(`items.${index}.quantity` as const, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Ціна (грн)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 text-sm"
                    {...register(`items.${index}.price` as const, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.price && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.items[index]?.price?.message}
                    </p>
                  )}
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
          onClick={() => append(emptyItem)}
          className="w-full border-dashed"
        >
          <Plus size={16} className="mr-2" /> Додати позицію
        </Button>

        <div className="flex justify-end gap-3 pt-2">
          {revision && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              Скасувати
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? 'Збереження...' : 'Зберегти кошторис'}
          </Button>
        </div>
      </form>
    );
  }

  if (!revision) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            Кошторис (версія {revision.version})
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              revision.status === 'agreed'
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {revision.status === 'agreed' ? 'Погоджено' : 'Чернетка'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {agreeError && (
            <span className="text-red-500 text-xs">{agreeError}</span>
          )}
          {revision.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={handleAgree}
              disabled={isPending}
            >
              <Check size={14} /> Погодити
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={14} />
            {revision.status === 'agreed' ? 'Нова редакція' : 'Редагувати'}
          </Button>
          {revision.status === 'agreed' && (
            <Link
              href={`/acts/create?projectId=${projectId}&fromEstimate=true`}
            >
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Створити акт з кошторису
              </Button>
            </Link>
          )}
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left">
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
              Назва
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
              Одиниця
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase text-right">
              К-сть
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase text-right">
              Ціна
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase text-right">
              Сума
            </th>
          </tr>
        </thead>
        <tbody>
          {revision.items.map((item, index) => (
            <tr key={index} className="border-b border-slate-50">
              <td className="px-4 py-2 text-slate-900">{item.name}</td>
              <td className="px-4 py-2 text-slate-500">{item.unit}</td>
              <td className="px-4 py-2 text-right text-slate-600">
                {item.quantity}
              </td>
              <td className="px-4 py-2 text-right text-slate-600">
                {formatMoney(item.price)}
              </td>
              <td className="px-4 py-2 text-right font-medium text-slate-900">
                {formatMoney(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={4}
              className="px-4 py-3 text-right font-semibold text-slate-700"
            >
              Разом за кошторисом
            </td>
            <td className="px-4 py-3 text-right font-bold text-slate-900">
              {formatMoney(total)} грн
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
