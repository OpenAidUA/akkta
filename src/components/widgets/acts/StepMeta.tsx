import { Input, Label } from '@/components/ui';
import type { StepProps } from '../../../app/(app)/acts/create/types';

export default function StepMeta({ register, errors }: StepProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-slate-700">
          Номер акту <span className="text-red-400">*</span>
        </Label>
        <Input
          type="text"
          className={`h-12 text-lg mt-1 ${errors.act?.meta?.number ? 'border-red-400 focus-visible:ring-red-400/40' : ''}`}
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
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700 mb-3">
            Дата <span className="text-red-400">*</span>
          </Label>
          <Input
            type="date"
            className={`h-12 mt-1 ${errors.act?.meta?.date ? 'border-red-400 focus-visible:ring-red-400/40' : ''}`}
            {...register('act.meta.date')}
          />
          {errors.act?.meta?.date && (
            <p className="text-red-500 text-xs">
              {errors.act.meta.date.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-700">
            Місто <span className="text-red-400">*</span>
          </Label>
          <Input
            type="text"
            className={`h-12 mt-1 ${errors.act?.meta?.city ? 'border-red-400 focus-visible:ring-red-400/40' : ''}`}
            placeholder="Київ"
            {...register('act.meta.city')}
          />
          {errors.act?.meta?.city && (
            <p className="text-red-500 text-xs">
              {errors.act.meta.city.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
