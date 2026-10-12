'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  Fragment,
} from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Check, Edit2, ChevronDown } from 'react-feather';
import Link from 'next/link';
import { Button, Input, Label } from '@/shared/ui';
import {
  agreeEstimateRevisionAction,
  createInitialEstimateRevisionAction,
  createNextEstimateRevisionAction,
  deleteProjectEstimateAction,
} from '@/modules/projects/actions';
import {
  ESTIMATE_CATEGORY_CODE,
  ESTIMATE_CATEGORY_LABEL,
  ESTIMATE_CATEGORY_ORDER,
  EstimateRevisionInputSchema,
  type EstimateCategory,
  type EstimateRevisionInput,
} from '@/modules/projects/domain';
import { X } from 'lucide-react';

export interface EstimateItemView {
  category: EstimateCategory;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  amount: number;
  source?: string | null;
  sourceDate?: string | null;
  note?: string | null;
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

const emptyItem = (category: EstimateCategory) => ({
  category,
  name: '',
  unit: '',
  quantity: 1,
  price: 0,
  source: '',
  sourceDate: '',
  note: '',
});

function formatMoney(n: number) {
  return n.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('uk-UA').format(date);
}

export function EstimateSection({ projectId, revision }: EstimateSectionProps) {
  const [isEditing, setIsEditing] = useState(!revision);
  const [isPending, startTransition] = useTransition();
  const [agreeError, setAgreeError] = useState<string | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const initialCategories = useMemo<EstimateCategory[]>(() => {
    if (!revision || revision.items.length === 0) return ['WORK'];
    const seen = new Set(revision.items.map((item) => item.category));
    return ESTIMATE_CATEGORY_ORDER.filter((category) => seen.has(category));
  }, [revision]);

  const [visibleCategories, setVisibleCategories] =
    useState<EstimateCategory[]>(initialCategories);

  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryMenuOpen]);

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
              category: item.category,
              name: item.name,
              unit: item.unit,
              quantity: item.quantity,
              price: item.price,
              source: item.source ?? '',
              sourceDate: item.sourceDate ?? '',
              note: item.note ?? '',
            }))
          : [emptyItem('WORK')],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const [formState, setFormState] = useState<{
    errors?: Record<string, string[]>;
    message?: string;
  } | null>(null);

  const availableCategoriesToAdd = ESTIMATE_CATEGORY_ORDER.filter(
    (category) => !visibleCategories.includes(category),
  );

  const handleAddCategory = (category: EstimateCategory) => {
    setVisibleCategories((prev) => [...prev, category]);
    append(emptyItem(category));
    setIsCategoryMenuOpen(false);
  };

  const handleRemoveCategory = (category: EstimateCategory) => {
    const indicesToRemove = fields
      .map((field, index) => ({ field, index }))
      .filter(({ field }) => field.category === category)
      .map(({ index }) => index);
    if (indicesToRemove.length > 0) {
      remove(indicesToRemove);
    }
    setVisibleCategories((prev) => prev.filter((c) => c !== category));
  };

  const onSubmit = (data: EstimateRevisionInput) => {
    startTransition(async () => {
      const formData = new FormData();
      data.items.forEach((item) => {
        formData.append('itemCategory', item.category);
        formData.append('itemName', item.name);
        formData.append('itemUnit', item.unit);
        formData.append('itemQuantity', String(item.quantity));
        formData.append('itemPrice', String(item.price));
        formData.append('itemSource', item.source ?? '');
        formData.append('itemSourceDate', item.sourceDate ?? '');
        formData.append('itemNote', item.note ?? '');
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

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteEstimate = () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteProjectEstimateAction(projectId);
      if (result?.error) {
        setDeleteError(result.error);
        setIsDeleteConfirmOpen(false);
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
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-6"
      >
        {formState?.message && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {formState.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Розділи кошторису
          </h2>
          <div className="relative" ref={categoryMenuRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
              disabled={availableCategoriesToAdd.length === 0}
            >
              <Plus size={14} />
              Додати категорію
              <ChevronDown size={12} />
            </Button>
            {isCategoryMenuOpen && availableCategoriesToAdd.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1">
                {availableCategoriesToAdd.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleAddCategory(category)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {ESTIMATE_CATEGORY_LABEL[category]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {visibleCategories.length === 0 && (
          <p className="text-xs text-slate-400">
            Додайте хоча б один розділ кошторису
          </p>
        )}

        {visibleCategories.map((category) => {
          const indices = fields
            .map((field, index) => ({ field, index }))
            .filter(({ field }) => field.category === category);

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  {ESTIMATE_CATEGORY_LABEL[category]}
                </h3>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  title="Видалити розділ"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {indices.length === 0 && (
                <p className="text-xs text-slate-400">
                  Немає позицій у цьому розділі
                </p>
              )}

              {indices.map(({ field, index }) => (
                <div
                  key={field.id}
                  className="p-4 pr-6 bg-slate-50 rounded-xl relative border border-slate-100"
                >
                  <input
                    type="hidden"
                    value={category}
                    {...register(`items.${index}.category` as const)}
                  />
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
                        Обсяг (X)
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
                        Ціна (Y), грн
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

                  <div className="flex gap-3 items-start mt-3">
                    <div className="flex-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Джерело
                      </Label>
                      <Input
                        className="h-9 text-sm"
                        placeholder="Прайс / КП / рахунок"
                        {...register(`items.${index}.source` as const)}
                      />
                    </div>
                    <div className="w-40">
                      <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Дата джерела
                      </Label>
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        {...register(`items.${index}.sourceDate` as const)}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Примітка
                    </Label>
                    <Input
                      className="h-9 text-sm"
                      placeholder="Склад операції, умови, комплектність..."
                      {...register(`items.${index}.note` as const)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-1 right-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyItem(category))}
                className="w-full border-dashed"
              >
                <Plus size={14} className="mr-2" />
                Додати до розділу &laquo;{ESTIMATE_CATEGORY_LABEL[category]}
                &raquo;
              </Button>
            </div>
          );
        })}

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
            className="bg-blue-600 m-0 hover:bg-blue-700 w-fit text-white"
          >
            {isPending ? 'Збереження...' : 'Зберегти кошторис'}
          </Button>
        </div>
      </form>
    );
  }

  if (!revision) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
        <p className="text-sm text-slate-500 mb-3">Кошторис ще не створено</p>
        <Button
          size="sm"
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={14} className="mr-1.5" />
          Створити кошторис
        </Button>
      </div>
    );
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
          {deleteError && (
            <span className="text-red-500 text-xs">{deleteError}</span>
          )}
          {revision.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={handleAgree}
              disabled={isPending}
            >
              <Check size={14} />
              <span className="hidden md:inline">Погодити</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={14} />
            <span className="hidden md:inline">
              {revision.status === 'agreed' ? 'Нова редакція' : 'Редагувати'}
            </span>
          </Button>
          {revision.status === 'agreed' && (
            <Link
              href={`/acts/create?projectId=${projectId}&fromEstimate=true`}
            >
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Створити акт
              </Button>
            </Link>
          )}
          {isDeleteConfirmOpen ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs text-slate-500"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isPending}
              >
                Ні
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleDeleteEstimate}
                disabled={isPending}
              >
                {isPending ? '...' : 'Так, видалити'}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={() => setIsDeleteConfirmOpen(true)}
              title="Видалити кошторис"
            >
              <Trash2 size={14} />
              <span className="hidden md:inline">Видалити</span>
            </Button>
          )}
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left">
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
              Позиція
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
              Робота / ресурс
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
              Одиниця
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase text-right">
              Обсяг
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase text-right">
              Ціна
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase text-right">
              Сума
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
              Джерело / дата
            </th>
            <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
              Примітка
            </th>
          </tr>
        </thead>
        <tbody>
          {ESTIMATE_CATEGORY_ORDER.map((category) => {
            const items = revision.items.filter(
              (item) => item.category === category,
            );
            if (items.length === 0) return null;

            const categoryTotal = items.reduce(
              (sum, item) => sum + item.amount,
              0,
            );

            return (
              <Fragment key={category}>
                <tr key={`${category}-header`} className="bg-slate-50">
                  <td
                    colSpan={8}
                    className="px-4 py-2 font-semibold text-slate-700 text-xs uppercase tracking-wide"
                  >
                    {ESTIMATE_CATEGORY_LABEL[category]}
                  </td>
                </tr>
                {items.map((item, index) => (
                  <tr
                    key={`${category}-${index}`}
                    className="border-b border-slate-50"
                  >
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                      {ESTIMATE_CATEGORY_CODE[category]}
                      {index + 1}
                    </td>
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
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                      {item.source || '—'}
                      {item.sourceDate && (
                        <span className="block text-[10px] text-slate-400">
                          {formatDate(item.sourceDate)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {item.note || '—'}
                    </td>
                  </tr>
                ))}
                <tr key={`${category}-subtotal`}>
                  <td
                    colSpan={5}
                    className="px-4 py-2 text-right text-xs font-medium text-slate-500"
                  >
                    Разом по розділу
                  </td>
                  <td className="px-4 py-2 text-right text-xs font-semibold text-slate-700">
                    {formatMoney(categoryTotal)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={5}
              className="px-4 py-3 text-right font-semibold text-slate-700"
            >
              Разом за кошторисом
            </td>
            <td className="px-4 py-3 text-right font-bold text-slate-900">
              {formatMoney(total)} грн
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
