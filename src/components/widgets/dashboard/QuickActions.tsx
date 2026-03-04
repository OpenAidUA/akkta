import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, AlertCircle } from 'react-feather';

interface QuickActionsProps {
  draftsCount: number;
  hasOrganizationData: boolean;
}

export function QuickActions({
  draftsCount,
  hasOrganizationData,
}: QuickActionsProps) {
  return (
    <div className="space-y-4">
      {/* Warning banner */}
      {!hasOrganizationData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              Налаштуйте дані організації
            </h3>
            <p className="text-xs text-amber-700 mb-3">
              Щоб у PDF-актах відображалась правильна інформація про виконавця
            </p>
            <Link href="/settings">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Перейти до налаштувань
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Drafts warning */}
      {draftsCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              У вас {draftsCount} {draftsCount === 1 ? 'чернетка' : draftsCount < 5 ? 'чернетки' : 'чернеток'}
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              Завершіть створення актів, щоб згенерувати PDF
            </p>
            <Link href="/acts">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Переглянути акти
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick actions card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Швидкі дії
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/acts/create" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 justify-start">
              <Plus size={18} />
              Створити акт
            </Button>
          </Link>
          <Link href="/clients/create" className="block">
            <Button
              variant="outline"
              className="w-full gap-2 justify-start border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <UserPlus size={18} />
              Додати клієнта
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
