import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClientForm from '@/components/forms/createClient/CreateClientForm';
import { getClientById } from '@/modules/clients/service';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { prisma } from '@/lib/db';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!membership) {
    return notFound();
  }

  const client = await getClientById(id, membership.organizationId);

  if (!client) {
    return notFound();
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-6">
        <Link
          href="/clients"
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад до списку
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          Редагувати клієнта
        </h1>
        <p className="text-sm text-slate-500 mt-1">{client.name}</p>
      </div>

      <ClientForm
        mode="edit"
        clientId={client.id}
        defaultValues={{
          name: client.name,
          edrpou: client.edrpou ?? undefined,
          contactName: client.contactName ?? undefined,
          phone: client.phone ?? undefined,
          email: client.email ?? undefined,
        }}
      />
    </div>
  );
}
