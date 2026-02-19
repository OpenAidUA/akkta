import { prisma } from '@/lib/db';
import { calculateTotals } from './helpers';
import { CreateActRequest } from './domain';
import type { ActWithClient } from './types';

export async function createAct(
  organizationId: string,
  userId: string,
  payload: CreateActRequest,
) {
  return await prisma.$transaction(async (tx) => {
    const validatedAct = calculateTotals(payload.act);

    let clientId: string | null = payload.client.id ?? null;
    const clientSnapshot = payload.client.snapshot;

    if (clientId) {
      const exists = await tx.client.findFirst({
        where: { id: clientId, organizationId },
      });

      if (!exists) {
        throw new Error('Client not found');
      }
    }

    if (payload.client.save === true && !clientId) {
      const client = await tx.client.create({
        data: {
          ...clientSnapshot,
          organizationId,
        },
      });
      clientId = client.id;
    }

    const act = await tx.act.create({
      data: {
        userId,
        organizationId,
        clientId,
        clientSnapshot,
        data: validatedAct,
        templateVersion: 'v1',
        status: 'draft',
      },
    });

    return act;
  });
}

export async function getUserActs(userId: string): Promise<ActWithClient[]> {
  const acts = await prisma.act.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      client: true,
    },
  });

  return acts as unknown as ActWithClient[];
}
