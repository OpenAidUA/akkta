import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { getOrganizationClients } from '@/modules/clients/service';
import { getOrganizationByUserId } from '@/modules/organizations/service';
import {
  getCurrentEstimateRevision,
  getProjectById,
} from '@/modules/projects/service';
import CreateActForm from '@/modules/acts/components/CreateActForm';

interface CreateActPageProps {
  searchParams: Promise<{
    projectId?: string;
    fromEstimate?: string;
  }>;
}

export default async function CreateActPage({
  searchParams,
}: CreateActPageProps) {
  const { projectId, fromEstimate } = await searchParams;

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

  // Resolve the optional project association server-side, scoped to the
  // user's organization, so a crafted projectId query param can never link
  // an act to a project the user has no access to.
  let project: { id: string; name: string } | undefined;
  let initialItems:
    | Array<{
        title: string;
        unit: string;
        quantity: number;
        unitPrice: number;
      }>
    | undefined;

  if (projectId && membership) {
    const found = await getProjectById(projectId, membership.organizationId);
    if (found) {
      project = { id: found.id, name: found.name };

      if (fromEstimate === 'true') {
        const revision = await getCurrentEstimateRevision(
          found.id,
          membership.organizationId,
        );
        if (revision) {
          // Acts document completed "роботи" only — materials, machinery,
          // delivery and taxes from the estimate are internal cost planning
          // and are not transferred into the act.
          initialItems = revision.items
            .filter((item) => item.category === 'WORK')
            .map((item) => ({
              title: item.name,
              unit: item.unit,
              quantity: Number(item.quantity),
              unitPrice: Number(item.price),
            }));
        }
      }
    }
  }

  return (
    <CreateActForm
      clients={clients}
      contractor={contractor}
      project={project}
      initialItems={initialItems}
    />
  );
}
