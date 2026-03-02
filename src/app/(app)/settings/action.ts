'use server';

import { createSupabaseServerClient } from '@/shared/superbase/server';
import { updateOrganization } from '@/modules/organizations/service';
import { UpdateOrganizationSchema } from '@/modules/organizations/domain';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type SettingsState = {
  errors?: {
    name?: string;
    edrpou?: string;
    representative?: string;
  };
  message?: string;
  success?: boolean;
} | null;

export async function updateOrganizationAction(
  prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { message: 'Unauthorized' };

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!membership) return { message: 'Організацію не знайдено' };

  const rawData = {
    name: formData.get('name') as string,
    edrpou: (formData.get('edrpou') as string) || undefined,
    representative: (formData.get('representative') as string) || undefined,
  };

  const validated = UpdateOrganizationSchema.safeParse(rawData);

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors;
    return {
      errors: {
        name: fieldErrors.name?.[0],
        edrpou: fieldErrors.edrpou?.[0],
        representative: fieldErrors.representative?.[0],
      },
      message: 'Validation failed',
    };
  }

  try {
    await updateOrganization(
      membership.organizationId,
      user.id,
      validated.data,
    );
    revalidatePath('/settings');
    return { success: true, message: 'Налаштування збережено' };
  } catch (error) {
    console.error(error);
    return { message: 'Не вдалося зберегти налаштування' };
  }
}
