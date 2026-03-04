import 'server-only';
import { prisma } from '@/lib/db';
import type { ActWithClient } from '@/modules/acts/types';
import type { ActDocument } from '@/modules/acts/domain';

export interface DashboardStats {
  totalActs: number;
  actsThisMonth: number;
  totalAmount: number;
  totalClients: number;
  draftsCount: number;
}

export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
  });

  if (!membership) {
    return {
      totalActs: 0,
      actsThisMonth: 0,
      totalAmount: 0,
      totalClients: 0,
      draftsCount: 0,
    };
  }

  const orgId = membership.organizationId;

  // Current month start
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalActs, actsThisMonth, acts, totalClients, draftsCount] =
    await Promise.all([
      prisma.act.count({ where: { organizationId: orgId } }),
      prisma.act.count({
        where: { organizationId: orgId, createdAt: { gte: startOfMonth } },
      }),
      prisma.act.findMany({
        where: { organizationId: orgId },
        select: { data: true },
      }),
      prisma.client.count({ where: { organizationId: orgId } }),
      prisma.act.count({
        where: { organizationId: orgId, status: 'draft' },
      }),
    ]);

  // Calculate total amount from all acts
  const totalAmount = acts.reduce((sum, act) => {
    const actData = act.data as ActDocument;
    const total = actData?.totals?.total ?? 0;
    return sum + (typeof total === 'number' ? total : 0);
  }, 0);

  return {
    totalActs,
    actsThisMonth,
    totalAmount,
    totalClients,
    draftsCount,
  };
}

export async function getRecentActs(
  userId: string,
  limit = 6,
): Promise<ActWithClient[]> {
  const acts = await prisma.act.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { client: true },
  });

  return acts as unknown as ActWithClient[];
}
