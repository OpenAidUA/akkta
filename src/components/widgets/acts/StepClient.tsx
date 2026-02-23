import { Check } from 'react-feather';
import {
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import type { StepProps } from '../../../app/(app)/acts/create/types';

export interface StepClientProps extends StepProps {
  clients: Array<{
    id: string;
    name: string;
    edrpou: string | null;
    phone: string | null;
    email: string | null;
  }>;
}

export default function StepClient(props: StepClientProps) {
  const { register, errors, setValue, watch, clients } = props;

  const selectedClientId = watch('client.id');

  const handleClientSelect = (value: string) => {
    if (value === 'new') {
      setValue('client.id', null);
      setValue('client.snapshot.name', '');
      setValue('client.snapshot.edrpou', '');
      setValue('client.save', true);
    } else {
      const selected = clients.find((c) => c.id === value);
      if (selected) {
        setValue('client.id', selected.id);
        setValue('client.snapshot.name', selected.name);
        setValue('client.snapshot.edrpou', selected.edrpou || '');
        setValue('client.save', false);
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Client Selection */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-slate-700">
          Оберіть клієнта
        </Label>
        <Select
          onValueChange={handleClientSelect}
          value={selectedClientId || 'new'}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Оберіть клієнта" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">➕ Новий клієнт</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} {c.edrpou ? `(ЄДРПОУ: ${c.edrpou})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative border-t border-slate-100 my-4">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-400">
          АБО ЗАПОВНІТЬ ВРУЧНУ
        </span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-slate-700">
          Хто клієнт? <span className="text-red-400">*</span>
        </Label>
        <Input
          type="text"
          className={`h-12 text-lg ${errors.client?.snapshot?.name ? 'border-red-400 focus-visible:ring-red-400/40' : ''}`}
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
        <Label className="text-sm font-semibold text-slate-700">
          ЄДРПОУ / ІПН{' '}
          <span className="text-slate-400 font-normal">
            (необов&apos;язково)
          </span>
        </Label>
        <Input
          type="text"
          className="h-12"
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
  );
}
