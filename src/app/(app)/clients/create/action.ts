'use server';

import { createSupabaseServerClient } from '@/shared/superbase/server';
import { createClient } from '@/modules/clients/service';
import { CreateClientSchema } from '@/modules/clients/domain';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export type CreateClientState = {
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
