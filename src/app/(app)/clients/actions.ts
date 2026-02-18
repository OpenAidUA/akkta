'use server';

import { createSupabaseServerClient } from '@/shared/superbase/server';
import { deleteClient } from '@/modules/clients/service';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';

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
