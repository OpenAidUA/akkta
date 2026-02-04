'use server';

import { createSupabaseServerClient } from '@/shared/superbase/server';
import { createAct } from '@/modules/acts/service';
import { CreateActRequestSchema } from '@/modules/acts/domain';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export type CreateActState = {
  errors?: any;
  message?: string;
} | null;

export async function createActAction(
  prevState: CreateActState,
  data: any, // We will receive JSON object here, not FormData, for simplicity with nested arrays
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
    const act = await createAct(organizationId, user.id, validation.data);
    // Success
  } catch (error: any) {
    console.error(error);
    return {
      message: error.message || 'Failed to create act',
    };
  }

  redirect('/acts');
}
