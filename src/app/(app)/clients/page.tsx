import { Button } from '@/components/ui/button';
import { Users, Plus, Edit2 } from 'react-feather';
import EmptyPagePlaceholder from '@/shared/components/EmptyPage';
import Link from 'next/link';
import { getOrganizationClients } from '@/modules/clients/service';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { prisma } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { DeleteClientButton } from '@/components/widgets/clients/DeleteClientButton';
import { ClientsToolbar } from '@/components/widgets/clients/ClientsToolbar';

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Клієнти</h1>
        {hasAnyClients && (
          <Link href="/clients/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={18} />
              Додати клієнта
            </Button>
          </Link>
        )}
      </div>

      {!hasAnyClients ? (
        <EmptyPagePlaceholder
          icon={<Users size={24} color="black" />}
          title="Клієнтів ще не додано"
          descr="Додайте своїх клієнтів, щоб пришвидшити створення документів."
        >
          <Link href="/clients/create">
            <Button
              className="bg-linear-to-r from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] text-white shadow-md transition-color duration-700 active:scale-95 gap-2"
              aria-label="Add Client"
            >
              <Plus size={18} />
              Додати клієнта
            </Button>
          </Link>
        </EmptyPagePlaceholder>
      ) : (
        <>
          {/* Toolbar: search + sort */}
          <ClientsToolbar
            search={q ?? ''}
            sortBy={sortBy}
            sortOrder={sortOrder}
            total={clients.length}
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                      Назва
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                      ЄДРПОУ / ІПН
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                      Контакт
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                      Телефон
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center">
                      Акти
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                      Додано
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-slate-400"
                      >
                        Нічого не знайдено за запитом «{q}»
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                          {client.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                          {client.edrpou || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {client.contactName || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {client.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {client.phone || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {client._count.acts > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                              {client._count.acts}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                          {formatDistanceToNow(new Date(client.createdAt), {
                            addSuffix: true,
                            locale: uk,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/clients/${client.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                              >
                                <Edit2 size={14} className="text-slate-500" />
                              </Button>
                            </Link>
                            <DeleteClientButton
                              clientId={client.id}
                              clientName={client.name}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
