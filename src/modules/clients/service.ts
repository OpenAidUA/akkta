import { prisma } from '@/lib/db';
import { CreateClientRequest } from './domain';

export async function getOrganizationClients(organizationId: string) {
  return await prisma.client.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createClient(
  organizationId: string,
  data: CreateClientRequest,
) {
  return await prisma.client.create({
    data: {
      organizationId,
      ...data,
    },
  });
}
