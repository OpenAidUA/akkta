'use client';

import { useState } from 'react';
import { Check, CreditCard } from 'react-feather';

const plans = [
  {
    id: 'basic',
    name: 'Базовий',
    description: 'Для фрилансерів та початківців',
    price: 'Безкоштовно',
    features: [
      'До 5 проєктів',
      'До 10 клієнтів',
      'PDF-акти',
      'Email підтримка',
    ],
    current: true,
  },
  {
    id: 'pro',
    name: 'Про',
    description: 'Для зростаючих команд і бізнесу',
    price: '149',
    features: [
      'Необмежені проєкти',
      'Необмежені клієнти',
      'PDF-акти з брендингом',
      'Пріоритетна підтримка',
      'Масове надсилання актів',
      'Аналітика та звіти',
    ],
    current: false,
  },
] as const;

export function BillingPlans() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <section aria-labelledby="billing-heading" className="space-y-6">
      <div>
        <h2
          id="billing-heading"
          className="text-xl font-semibold text-slate-900"
        >
          Тарифний план
        </h2>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Оберіть план, що підходить для вашої команди
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-8">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={[
              'flex min-w-0 flex-col rounded-2xl border bg-white p-5',
              'sm:p-7',
              plan.current ? 'border-slate-200' : 'border-2 border-blue-500',
            ].join(' ')}
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={[
                      'text-xl font-semibold sm:text-2xl',
                      plan.current ? 'text-slate-900' : 'text-blue-600',
                    ].join(' ')}
                  >
                    {plan.name}
                  </h3>

                  {plan.current ? (
                    <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                      Поточний план
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
                      Pro
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                  {plan.description}
                </p>
              </div>

              <div className="shrink-0">
                {plan.current ? (
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {plan.price}
                  </p>
                ) : (
                  <p className="whitespace-nowrap text-slate-900">
                    <span className="text-3xl font-bold sm:text-4xl">
                      {plan.price}
                    </span>
                    <span className="ml-1 text-sm text-slate-500">грн/міс</span>
                  </p>
                )}
              </div>
            </div>

            <div className="my-5 border-t border-slate-200 sm:my-6" />

            <ul className="flex-1 space-y-4">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-800 sm:text-base"
                >
                  <Check
                    aria-hidden="true"
                    size={19}
                    className="mt-0.5 shrink-0 text-green-500"
                    strokeWidth={3}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.current ? (
              <div
                aria-current="true"
                className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-400 sm:mt-8"
              >
                Активний
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setNotice(
                    'Підключення Pro стане доступним після інтеграції платіжного сервісу.',
                  )
                }
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:mt-8 sm:text-base"
              >
                <CreditCard size={18} aria-hidden="true" />
                Підключити Pro за 149 грн
              </button>
            )}
          </article>
        ))}
      </div>

      {notice && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700"
        >
          {notice}
        </p>
      )}
    </section>
  );
}
