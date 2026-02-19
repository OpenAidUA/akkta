import { getOrganizationClients } from '@/modules/clients/service';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { prisma } from '@/lib/db';
import { ClientsToolbar } from '@/components/widgets/clients/ClientsToolbar';
import ClientsList from '@/components/widgets/clients/ClientsList';
import { ClientsEmptyState } from '@/components/widgets/clients/ClientsEmptyState';
import { ClientsPageHeader } from '@/components/widgets/clients/ClientsPageHeader';

interface ClientsPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    order?: string;
  }>;
}

export default async function Clients({ searchParams }: ClientsPageProps) {
  const { q, sort, order } = await searchParams;

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

  const sortBy = sort === 'name' ? 'name' : 'createdAt';
  const sortOrder =
    order === 'asc'
      ? 'asc'
      : order === 'desc'
        ? 'desc'
        : sortBy === 'name'
          ? 'asc'
          : 'desc';

  const clients = membership
    ? await getOrganizationClients(membership.organizationId, {
        search: q,
        sortBy,
        sortOrder,
      })
    : [];

  const hasAnyClients = membership
    ? (await prisma.client.count({
        where: { organizationId: membership.organizationId },
      })) > 0
    : false;

  return (
    <>
      <ClientsPageHeader hasAnyClients={hasAnyClients} />

      {!hasAnyClients ? (
        <ClientsEmptyState />
      ) : (
        <>
          <ClientsToolbar
            search={q ?? ''}
            sortBy={sortBy}
            sortOrder={sortOrder}
            total={clients.length}
          />

          <ClientsList clients={clients} searchQuery={q || ''} />
        </>
      )}
    </>
  );
}
