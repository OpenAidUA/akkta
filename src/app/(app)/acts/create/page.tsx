import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { getOrganizationClients } from '@/modules/clients/service';
import { getOrganizationByUserId } from '@/modules/organizations/service';
import CreateActForm from '@/modules/acts/components/CreateActForm';

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

  const [clients, org] = await Promise.all([
    membership
      ? getOrganizationClients(membership.organizationId)
      : Promise.resolve([]),
    getOrganizationByUserId(user.id),
  ]);

  const contractor = {
    name: org?.name ?? '',
    representative: org?.representative ?? '',
  };

  return <CreateActForm clients={clients} contractor={contractor} />;
}
