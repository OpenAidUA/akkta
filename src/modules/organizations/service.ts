import 'server-only';
import { prisma } from '@/lib/db';
import type { UpdateOrganizationRequest } from './domain';

/**
 * Resolves the user's "active" organization membership deterministically.
 *
 * There is currently no explicit "current workspace" selection (session/
 * cookie) for users who belong to multiple organizations, so we fall back to
 * a stable tie-breaker (`id: 'asc'`) instead of relying on the database's
 * unspecified default order. This guarantees the same membership is picked
 * on every call for a given user, avoiding requests "jumping" between
 * organizations depending on query plan/insertion order.
 *
 * TODO: replace with an explicit per-session selected workspace once
 * multi-organization switching is supported.
 */
export async function getActiveMembership(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    orderBy: { id: 'asc' },
  });
}

export async function getOrganizationByUserId(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    orderBy: { id: 'asc' },
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
