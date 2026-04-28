import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { FileText, Download } from 'react-feather';

import type { ActWithClient } from '@/modules/acts/types';

const statusConfig = {
  draft: {
    label: 'Чернетка',
    className: 'bg-gray-100 text-gray-800',
  },
  generating: {
    label: 'Генерація...',
    className: 'bg-yellow-100 text-yellow-800',
  },
  ready: {
    label: 'Готовий',
    className: 'bg-green-100 text-green-800',
  },
  failed: { label: 'Помилка', className: 'bg-red-100 text-red-800' },
};

interface ActItemProps {
  act: ActWithClient;
}

export const ActItem: React.FC<ActItemProps> = ({ act }) => {
  const actData = act.data;
  const actNumber = actData?.meta?.number || '—';
  const dateStr = actData?.meta?.date
    ? format(new Date(actData.meta.date), 'd MMM yyyy', {
        locale: uk,
      })
    : '—';
  const clientName =
    act.clientSnapshot?.name || act.client?.name || 'Без назви';

  const total =
    typeof actData?.totals?.total === 'number'
      ? new Intl.NumberFormat('uk-UA', {
          style: 'currency',
          currency: 'UAH',
        }).format(actData.totals.total)
      : '—';

  const status = statusConfig[act.status] || statusConfig.draft;

  return (
    <div className="divide-y divide-slate-100">
      <div
        key={act.id}
        className="px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/acts/${act.id}`}
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
              >
                Акт № {actNumber}
              </Link>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="truncate">{clientName}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{dateStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden sm:block text-sm font-semibold text-slate-900 whitespace-nowrap">
              {total}
            </span>
            <Link
              className="p-2 rounded-md text-slate-400 hover:bg-blue-600/10"
              href={`/acts/${act.id}`}
            >
              <FileText size={16} />
            </Link>
            {act.status === 'ready' && (
              <Link
                href={`/api/acts/${act.id}/pdf`}
                download
                className="p-2 rounded-md text-slate-400 hover:bg-blue-600/10"
              >
                <Download size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile amount */}
        <div className="sm:hidden text-sm font-semibold text-slate-900 mt-2">
          {total}
        </div>
      </div>
    </div>
  );
};
