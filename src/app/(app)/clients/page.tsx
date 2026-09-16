import { getPaginatedOrganizationClients } from '@/modules/clients/service';
import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { ClientsToolbar } from '@/modules/clients/components/ClientsToolbar';
import ClientsList from '@/modules/clients/components/ClientsList';
import { ClientsEmptyState } from '@/modules/clients/components/ClientsEmptyState';
import { ClientsPageHeader } from '@/modules/clients/components/ClientsPageHeader';
import { parsePage } from '@/lib/pagination';
import { PaginationControls } from '@/shared/components/PaginationControls';

interface ClientsPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

export default async function Clients({ searchParams }: ClientsPageProps) {
  const { q, sort, order, page: pageParam } = await searchParams;

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
    ? await getPaginatedOrganizationClients(membership.organizationId, {
        search: q,
        sortBy,
        sortOrder,
        page: parsePage(pageParam),
      })
    : { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 };

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
            total={clients.total}
          />

          <ClientsList clients={clients.items} searchQuery={q || ''} />
          <PaginationControls
            page={clients.page}
            totalPages={clients.totalPages}
            pathname="/clients"
            searchParams={{ q, sort, order }}
          />
        </>
      )}
    </>
  );
}
