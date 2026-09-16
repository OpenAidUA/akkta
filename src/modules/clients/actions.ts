'use server';

import { createSupabaseServerClient } from '@/shared/supabase/server';
import {
  createClient,
  deleteClient,
  updateClient,
} from '@/modules/clients/service';
import { CreateClientSchema, ClientSchema } from '@/modules/clients/domain';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export type CreateClientState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

export type UpdateClientState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

export async function createClientAction(
  prevState: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Unauthorized' };
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!membership) {
    return { message: 'Organization not found' };
  }

  const rawData = {
    name: formData.get('name'),
    edrpou: formData.get('edrpou') || undefined,
    contactName: formData.get('contactName') || undefined,
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
  };

  const validated = CreateClientSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    await createClient(membership.organizationId, validated.data);
  } catch (e) {
    console.error(e);
    return { message: 'Failed to create client' };
  }

  redirect('/clients');
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!membership) {
    return { error: 'Organization not found' };
  }

  try {
    await deleteClient(clientId, membership.organizationId);
  } catch (e) {
    console.error(e);
    return { error: "Не вдалось видалити клієнта. Можливо, є пов'язані акти." };
  }

  revalidatePath('/clients');
  return { success: true };
}

export async function updateClientAction(
  clientId: string,
  prevState: UpdateClientState,
  formData: FormData,
): Promise<UpdateClientState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Unauthorized' };
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!membership) {
    return { message: 'Organization not found' };
  }

  const rawData = {
    name: formData.get('name'),
    edrpou: formData.get('edrpou') || undefined,
    contactName: formData.get('contactName') || undefined,
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
  };

  const validated = ClientSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    await updateClient(clientId, membership.organizationId, validated.data);
  } catch (e) {
    console.error(e);
    return { message: 'Не вдалось оновити клієнта' };
  }

  redirect('/clients');
}
