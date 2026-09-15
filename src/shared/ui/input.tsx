import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base text-slate-900',
          'placeholder:text-slate-400',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:bg-white',
          'hover:border-slate-300',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
