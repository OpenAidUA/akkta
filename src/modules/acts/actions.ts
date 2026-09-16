'use server';

import { createSupabaseServerClient } from '@/shared/supabase/server';
import {
  createAct,
  generateAndSaveActPdf,
  updateAct,
} from '@/modules/acts/service';
import {
  CreateActRequestSchema,
  type CreateActRequest,
} from '@/modules/acts/domain';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type CreateActState = {
  errors?: { [K in keyof CreateActRequest]?: string[] };
  message?: string;
} | null;

export type GeneratePdfState = {
  message?: string;
  error?: boolean;
} | null;

export type UpdateActState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

export async function createActAction(
  prevState: CreateActState,
  data: CreateActRequest,
): Promise<CreateActState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Unauthorized' };
  }

  // Find user's organization (assuming 1 organization for MVP)
  // We need to fetch it from DB relation.
  // We can query prisma.organizationMember
  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!membership) {
    return { message: 'Organization not found for user' };
  }

  const organizationId = membership.organizationId;

  // Validate payload
  const validation = CreateActRequestSchema.safeParse(data);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    await createAct(organizationId, user.id, validation.data);
  } catch (error: unknown) {
    console.error(error);
    return {
      message: error instanceof Error ? error.message : 'Failed to create act',
    };
  }

  redirect('/acts');
}

export async function generatePdfAction(
  actId: string,
): Promise<GeneratePdfState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Unauthorized', error: true };
  }

  try {
    await generateAndSaveActPdf(actId, user.id);
    revalidatePath(`/acts/${actId}`);
    revalidatePath('/acts');
    return { message: 'PDF успішно згенеровано!' };
  } catch (error: unknown) {
    console.error('PDF generation failed:', error);
    return {
      message:
        error instanceof Error ? error.message : 'Не вдалося згенерувати PDF',
      error: true,
    };
  }
}

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
