import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'react-feather';
import { Button, Input, Label } from '@/components/ui';
import type { StepProps } from '../../../app/(app)/acts/create/types';

export default function StepItems({ register, errors, control }: StepProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'act.items',
  });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
      <div className="space-y-3 max-h-100 overflow-y-auto pr-2 -mr-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-6 bg-slate-50 rounded-xl relative group border border-slate-100"
          >
            <div className="mb-3">
              <Input
                type="text"
                className={`text-sm font-medium ${errors.act?.items?.[index]?.title ? 'border-red-400 focus-visible:ring-red-400/40' : ''}`}
                placeholder="Опис послуги чи товару *"
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
                <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Кількість <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  className={`h-9 text-sm ${errors.act?.items?.[index]?.quantity ? 'border-red-400 focus-visible:ring-red-400/40' : ''}`}
                  {...register(`act.items.${index}.quantity` as const, {
                    valueAsNumber: true,
                  })}
                />
                {errors.act?.items?.[index]?.quantity && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.act.items[index].quantity.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Ціна (грн) <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  className={`h-9 text-sm ${errors.act?.items?.[index]?.unitPrice ? 'border-red-400 focus-visible:ring-red-400/40' : ''}`}
                  {...register(`act.items.${index}.unitPrice` as const, {
                    valueAsNumber: true,
                  })}
                />
                {errors.act?.items?.[index]?.unitPrice && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.act.items[index].unitPrice.message}
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
        onClick={() => append({ title: '', quantity: 1, unitPrice: 0 })}
        className="w-full border-dashed"
      >
        <Plus size={16} className="mr-2" /> Додати позицію
      </Button>
    </div>
  );
}
