import { Button } from '@/components/ui/button';
import { Users, Plus } from 'react-feather';
import EmptyPagePlaceholder from '@/shared/components/EmptyPage';
import Link from 'next/link';
import { getOrganizationClients } from '@/modules/clients/service';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { prisma } from '@/lib/db';
import { ClientCard } from '@/components/widgets/clients/ClientCard';

export default async function Clients() {
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

  // If no membership (should handle onboarding properly later), just empty list
  const clients = membership
    ? await getOrganizationClients(membership.organizationId)
    : [];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Клієнти</h1>
        {clients.length > 0 && (
          <Link href="/clients/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={18} />
              Додати клієнта
            </Button>
          </Link>
        )}
      </div>

      {clients.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
