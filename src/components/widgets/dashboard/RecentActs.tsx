import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Download, ArrowRight } from 'react-feather';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { ActWithClient } from '@/modules/acts/types';

interface RecentActsProps {
  acts: ActWithClient[];
}

export function RecentActs({ acts }: RecentActsProps) {
  if (acts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <FileText size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 mb-4">Актів ще немає</p>
        <Link href="/acts/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            Створити перший акт
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Останні акти</h2>
        <Link
          href="/acts"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Всі акти
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {acts.map((act) => {
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

          const statusConfig = {
            draft: { label: 'Чернетка', className: 'bg-gray-100 text-gray-800' },
            generating: {
              label: 'Генерація...',
              className: 'bg-yellow-100 text-yellow-800',
            },
            ready: { label: 'Готовий', className: 'bg-green-100 text-green-800' },
            failed: { label: 'Помилка', className: 'bg-red-100 text-red-800' },
          };

          const status = statusConfig[act.status] || statusConfig.draft;

          return (
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

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:block text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {total}
                  </span>
                  <Link href={`/acts/${act.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                      title="Переглянути"
                    >
                      <FileText size={16} />
                    </Button>
                  </Link>
                  {act.status === 'ready' && (
                    <a href={`/api/acts/${act.id}/pdf`} download>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-green-600"
                        title="Завантажити PDF"
                      >
                        <Download size={16} />
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Mobile amount */}
              <div className="sm:hidden text-sm font-semibold text-slate-900 mt-2">
                {total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
