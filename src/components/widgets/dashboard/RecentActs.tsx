import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'react-feather';
import type { ActWithClient } from '@/modules/acts/types';

import { ActItem } from './ActItem';

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
        {acts.map((act) => (
          <ActItem key={act.id} act={act} />
        ))}
      </div>
    </div>
  );
}
