'use server';

import { createSupabaseServerClient } from '@/shared/superbase/server';
import { updateClient } from '@/modules/clients/service';
import { ClientSchema } from '@/modules/clients/domain';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export type UpdateClientState = {
  errors?: any;
  message?: string;
} | null;

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
