import { notFound } from 'next/navigation';
import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { getActById } from '@/modules/acts/service';
import { getOrganizationClients } from '@/modules/clients/service';
import { prisma } from '@/lib/db';
import EditActForm from './EditActForm';

interface EditActPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditActPage({ params }: EditActPageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const act = await getActById(id, user.id);
  if (!act) return notFound();

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  const clients = membership
    ? await getOrganizationClients(membership.organizationId)
    : [];

  return (
    <div>
      <div className="max-w-2xl mx-auto pt-10 px-4">
        <Link
          href={`/acts/${id}`}
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад до акту
        </Link>
      </div>
      <EditActForm act={act} clients={clients} />
    </div>
  );
}
