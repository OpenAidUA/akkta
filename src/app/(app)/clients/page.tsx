import { Button } from '@/components/ui/button';
import { Users, Plus, Phone, Mail, FileText } from 'react-feather';
import EmptyPagePlaceholder from '@/shared/components/EmptyPage';
import Link from 'next/link';
import { getOrganizationClients } from '@/modules/clients/service';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { prisma } from '@/lib/db';

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
            <div
              key={client.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow group relative"
            >
               <div className="mb-4">
                  <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{client.name}</h3>
                  {client.edrpou && (
                    <p className="text-xs text-slate-500 font-mono mt-1">ЄДРПОУ: {client.edrpou}</p>
                  )}
               </div>
               
               <div className="space-y-2 text-sm text-slate-600">
                  {client.contactName && (
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span>{client.contactName}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                       <Phone size={14} className="text-slate-400" />
                       <span>{client.phone}</span>
                    </div>
                  )}
                   {client.email && (
                    <div className="flex items-center gap-2">
                       <Mail size={14} className="text-slate-400" />
                       <span className="truncate">{client.email}</span>
                    </div>
                  )}
               </div>

               <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-xs text-slate-400">12 актів</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                     <FileText size={14} className="text-slate-500" />
                  </Button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
