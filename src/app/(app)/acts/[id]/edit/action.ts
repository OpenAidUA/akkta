'use server';

import { createSupabaseServerClient } from '@/shared/superbase/server';
import { updateAct } from '@/modules/acts/service';
import {
  CreateActRequestSchema,
  type CreateActRequest,
} from '@/modules/acts/domain';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type UpdateActState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

export async function updateActAction(
  actId: string,
  data: CreateActRequest,
): Promise<UpdateActState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { message: 'Unauthorized' };

  const validation = CreateActRequestSchema.safeParse(data);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
      message: 'Validation failed',
    };
  }

  try {
    await updateAct(actId, user.id, validation.data);
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error.message : 'Failed to update act',
    };
  }

  revalidatePath(`/acts/${actId}`);
  revalidatePath('/acts');
  redirect(`/acts/${actId}`);
}
