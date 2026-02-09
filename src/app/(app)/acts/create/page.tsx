import { createSupabaseServerClient } from '@/shared/superbase/server';
import { prisma } from '@/lib/db';
import { getOrganizationClients } from '@/modules/clients/service';
import CreateActForm from './CreateActForm';

export default async function CreateActPage() {
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

  const clients = membership
    ? await getOrganizationClients(membership.organizationId)
    : [];

  return <CreateActForm clients={clients} />;
}
