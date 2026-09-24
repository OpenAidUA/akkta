import { ArrowLeft, Edit2, MapPin, Calendar, Plus, User } from 'react-feather';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { getActiveMembership } from '@/modules/organizations/service';
import {
  getCurrentEstimateRevision,
  getProjectActs,
  getProjectById,
  getProjectStats,
} from '@/modules/projects/service';
import { Button } from '@/shared/ui/button';
import { ArchiveProjectButton } from '@/modules/projects/components/ArchiveProjectButton';
import { DeleteProjectButton } from '@/modules/projects/components/DeleteProjectButton';
import { EstimateSection } from '@/modules/projects/components/EstimateSection';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL = {
  active: 'Активний',
  archived: 'Архівний',
} as const;

const STATUS_CLASS = {
  active: 'bg-green-50 text-green-700',
  archived: 'bg-slate-100 text-slate-500',
} as const;

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('uk-UA').format(date);
}

function formatMoney(n: number) {
  return n.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const ACT_STATUS_LABEL: Record<string, string> = {
  draft: 'Чернетка',
  generating: 'Генерується',
  ready: 'Готово',
  failed: 'Помилка',
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const membership = await getActiveMembership(user.id);

  if (!membership) {
    return notFound();
  }

  const project = await getProjectById(id, membership.organizationId);

  if (!project) {
    return notFound();
  }

  const [stats, acts, currentRevision] = await Promise.all([
    getProjectStats(project.id, membership.organizationId),
    getProjectActs(project.id, membership.organizationId),
    getCurrentEstimateRevision(project.id, membership.organizationId),
  ]);

  const revisionView = currentRevision
    ? {
        id: currentRevision.id,
        version: currentRevision.version,
        status: currentRevision.status,
        items: currentRevision.items.map((item) => ({
          name: item.name,
          unit: item.unit,
          quantity: Number(item.quantity),
          price: Number(item.price),
          amount: Number(item.amount),
        })),
      }
    : null;

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад до списку
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {project.name}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[project.status]}`}
              >
                {STATUS_LABEL[project.status]}
              </span>
            </div>
            {project.address && (
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin size={14} />
                {project.address}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/projects/${project.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit2 size={14} />
                Редагувати
              </Button>
            </Link>
            <ArchiveProjectButton
              projectId={project.id}
              status={project.status}
            />
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.name}
            />
          </div>
        </div>
      </div>

      {project.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Опис робіт
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User size={14} /> Замовник
          </h2>
          <p className="text-sm font-medium text-slate-900">
            {project.primaryClient?.name || '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar size={14} /> Плановий термін
          </h2>
          <p className="text-sm font-medium text-slate-900">
            {formatDate(project.plannedStartDate)} —{' '}
            {formatDate(project.plannedEndDate)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Сума актів (документально)
          </h2>
          <p className="text-sm font-medium text-slate-900">
            {formatMoney(stats.actsDocumentTotal)} грн
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Не є підтвердженням оплати
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Кошторис</h2>
        <EstimateSection projectId={project.id} revision={revisionView} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Акти проєкту</h2>
          <Link href={`/acts/create?projectId=${project.id}`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <Plus size={14} />
              Додати акт
            </Button>
          </Link>
        </div>

        {acts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            До цього проєкту ще не додано жодного акту
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
                    Номер
                  </th>
                  <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
                    Клієнт
                  </th>
                  <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
                    Статус
                  </th>
                  <th className="px-4 py-2 font-semibold text-slate-500 text-xs uppercase">
                    Додано
                  </th>
                </tr>
              </thead>
              <tbody>
                {acts.map((act) => (
                  <tr key={act.id} className="border-b border-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/acts/${act.id}`}
                        className="text-slate-900 font-medium hover:text-blue-600 transition-colors"
                      >
                        {(act.data as { meta?: { number?: string } })?.meta
                          ?.number || act.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {act.client?.name || '—'}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {ACT_STATUS_LABEL[act.status] || act.status}
                    </td>
                    <td className="px-4 py-2 text-slate-400 text-xs">
                      {formatDistanceToNow(new Date(act.createdAt), {
                        addSuffix: true,
                        locale: uk,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
