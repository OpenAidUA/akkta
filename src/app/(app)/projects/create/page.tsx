import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { getActiveMembership } from '@/modules/organizations/service';
import ProjectForm from '@/modules/projects/components/ProjectForm';

export default async function CreateProjectPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const membership = await getActiveMembership(user.id);

  const clients = membership
    ? await prisma.client.findMany({
        where: { organizationId: membership.organizationId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      })
    : [];

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-6">
        <Link
          href="/projects"
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад до списку
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Новий проєкт</h1>
      </div>

      <ProjectForm clients={clients} />
    </div>
  );
}
