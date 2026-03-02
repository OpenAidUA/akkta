import 'server-only';
import { prisma } from '@/lib/db';
import type { UpdateOrganizationRequest } from './domain';

export async function getOrganizationByUserId(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  });
  return membership?.organization ?? null;
}

export async function updateOrganization(
  organizationId: string,
  userId: string,
  data: UpdateOrganizationRequest,
) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
  });

  if (!membership) throw new Error('Unauthorized');

  return prisma.organization.update({
    where: { id: organizationId },
    data: {
      name: data.name,
      edrpou: data.edrpou || null,
      representative: data.representative || null,
    },
  });
}
