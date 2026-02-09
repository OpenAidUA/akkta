import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilePlus, Plus, FileText, Download } from 'react-feather';
import EmptyPagePlaceholder from '@/shared/components/EmptyPage';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { getUserActs } from '@/modules/acts/service';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import OfflineSyncBanner from './OfflineSyncBanner';

export const dynamic = 'force-dynamic';

export default async function Acts() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const acts = await getUserActs(user.id);

  return (
    <>
      <OfflineSyncBanner />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Мої Акти</h1>
        {acts.length > 0 && (
          <Link href="/acts/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={18} />
              Створити акт
            </Button>
          </Link>
        )}
      </div>

      {acts.length === 0 ? (
        <EmptyPagePlaceholder
          icon={<FilePlus size={24} className="text-slate-400" />}
          title="Актів ще не створено"
          descr="Тут з'являтимуться ваші акти виконаних робіт. Створіть свій перший документ, щоб розпочати — це займе близько хвилини."
        >
          <Link href="/acts/create">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 gap-2"
              aria-label="Create Act"
            >
              <Plus size={18} />
              Створити акт
            </Button>
          </Link>
        </EmptyPagePlaceholder>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Номер / Дата</th>
                <th className="px-6 py-4">Клієнт</th>
                <th className="px-6 py-4">Сума</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {acts.map((act) => {
                // Cast to any to access json fields safely for now or assume structure from helper
                const actData = act.data as any;
                const total =
                  actData?.totals?.totalText ||
                  (actData?.items?.[0]?.total
                    ? `${actData.items[0].total} грн`
                    : '—');
                const actNumber = actData?.meta?.number || '—';
                const dateStr = actData?.meta?.date
                  ? format(new Date(actData.meta.date), 'd MMM yyyy', {
                      locale: uk,
                    })
                  : '—';
                const clientName =
                  (act.clientSnapshot as any)?.name ||
                  act.client?.name ||
                  'Без назви';

                return (
                  <tr
                    key={act.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          № {actNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          {dateStr}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {clientName}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {/* Better formatting could go here */}
                      {typeof actData?.totals?.total === 'number'
                        ? new Intl.NumberFormat('uk-UA', {
                            style: 'currency',
                            currency: 'UAH',
                          }).format(actData.totals.total)
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${act.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {act.status === 'draft' ? 'Чернетка' : act.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/acts/${act.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                          >
                            <FileText size={16} />
                          </Button>
                        </Link>
                        {act.status === 'ready' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                          >
                            <Download size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
