'use client';

import { useId, type ReactNode } from 'react';

import { Label } from '@/shared/ui';

/** Props to spread onto the control (Input, textarea, SelectTrigger...). */
export interface FieldControlProps {
  id: string;
  className: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  'aria-describedby'?: string;
}

// Only active when aria-invalid="true", so it is safe to apply always.
const CONTROL_CLASS =
  'aria-invalid:border-red-400 aria-invalid:focus-visible:ring-red-400/40';

interface FormFieldProps {
  label: ReactNode;
  icon?: ReactNode;
  error?: string;
  /** Visual + aria marker only; real validation lives in the Zod schema. */
  required?: boolean;
  optional?: boolean;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label + control + error message, wired together for accessibility
 * (htmlFor / aria-invalid / aria-describedby). Removes the copy-pasted
 * markup that every field used to repeat.
 */
export function FormField({
  label,
  icon,
  error,
  required,
  optional,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
      >
        {icon}
        <span>
          {label}
          {required && (
            <span aria-hidden className="ml-1 text-red-400">
              *
            </span>
          )}
          {optional && (
            <span className="ml-1 font-normal text-slate-400">
              (необов&apos;язково)
            </span>
          )}
        </span>
      </Label>

      {children({
        id,
        className: CONTROL_CLASS,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}

      {error && (
        <p id={errorId} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
