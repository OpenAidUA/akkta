import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { getActiveMembership } from '@/modules/organizations/service';
import { getProjectById } from '@/modules/projects/service';
import ProjectForm from '@/modules/projects/components/ProjectForm';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

function toDateInputValue(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
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

  const clients = await prisma.client.findMany({
    where: { organizationId: membership.organizationId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-6">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад до проєкту
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Редагувати проєкт</h1>
        <p className="text-sm text-slate-500 mt-1">{project.name}</p>
      </div>

      <ProjectForm
        mode="edit"
        projectId={project.id}
        clients={clients}
        defaultValues={{
          name: project.name,
          address: project.address ?? undefined,
          description: project.description ?? undefined,
          status: project.status,
          plannedStartDate: toDateInputValue(project.plannedStartDate),
          plannedEndDate: toDateInputValue(project.plannedEndDate),
          primaryClientId: project.primaryClientId ?? undefined,
        }}
      />
    </div>
  );
}
