import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { getActiveMembership } from '@/modules/organizations/service';
import CreateProjectForm from '@/modules/projects/components/CreateProjectForm';

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
        select: {
          id: true,
          name: true,
          edrpou: true,
          phone: true,
          email: true,
        },
        orderBy: { name: 'asc' },
      })
    : [];

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <h1 className="text-2xl text-center mb-6 font-bold text-slate-900">
        Новий проєкт
      </h1>

      <CreateProjectForm clients={clients} />
    </div>
  );
}
