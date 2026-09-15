import { twMerge } from 'tailwind-merge';
import { STEPS } from '../../../app/(app)/acts/create/types';

interface FormStepperProps {
  currentStep: number;
}

export default function FormStepper({ currentStep }: FormStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <div
            key={step.id}
            className="flex items-center flex-1 last:flex-initial"
          >
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={twMerge(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ring-4',
                  isCompleted
                    ? 'bg-blue-600 text-white ring-blue-100'
                    : isActive
                      ? 'bg-blue-600 text-white ring-blue-100 shadow-lg shadow-blue-600/30'
                      : 'bg-slate-100 text-slate-400 ring-white',
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={twMerge(
                  'text-xs font-medium transition-colors duration-300 whitespace-nowrap',
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

            {/* Connector line */}
            {idx !== STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full overflow-hidden bg-slate-100">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
