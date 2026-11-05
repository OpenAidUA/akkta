import { twMerge } from 'tailwind-merge';

import type { FormNotice } from '@/modules/acts/hooks/use-create-act-form';

interface FormAlertProps {
  notice: FormNotice | null;
  className?: string;
}

export default function FormAlert({ notice, className }: FormAlertProps) {
  return (
    <div role="alert" aria-live="assertive" className={className}>
      {notice && (
        <p
          className={twMerge(
            'rounded-xl border px-4 py-3 text-sm',
            notice.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-blue-200 bg-blue-50 text-blue-700',
          )}
        >
          {notice.message}
        </p>
      )}
    </div>
  );
}
