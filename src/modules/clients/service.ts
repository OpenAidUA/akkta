import { prisma } from '@/lib/db';
import { CreateClientRequest, UpdateClientRequest } from './domain';

export interface GetClientsOptions {
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export async function getOrganizationClients(
  organizationId: string,
  options: GetClientsOptions = {},
) {
  const { search, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  return await prisma.client.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { edrpou: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: { acts: true },
      },
    },
  });
}

export async function getClientById(clientId: string, organizationId: string) {
  return await prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId,
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

export async function updateClient(
  clientId: string,
  organizationId: string,
  data: UpdateClientRequest,
) {
  return await prisma.client.update({
    where: {
      id: clientId,
      organizationId,
    },
    data,
  });
}

export async function deleteClient(clientId: string, organizationId: string) {
  return await prisma.client.delete({
    where: {
      id: clientId,
      organizationId,
    },
  });
}
