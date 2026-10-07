'use server';

import { createSupabaseServerClient } from '@/shared/supabase/server';
import {
  agreeEstimateRevision,
  archiveProject,
  createInitialEstimateRevision,
  createNextEstimateRevision,
  createProject,
  createProjectWithClient,
  deleteProject,
  deleteProjectEstimate,
  EstimateConflictError,
  unarchiveProject,
  updateProject,
} from '@/modules/projects/service';
import {
  CreateProjectWithClientSchema,
  EstimateRevisionInputSchema,
  ProjectSchema,
  type CreateProjectWithClientRequest,
  type EstimateCategory,
} from '@/modules/projects/domain';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getActiveMembership } from '@/modules/organizations/service';

export type CreateProjectState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

export type UpdateProjectState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

async function requireOrganizationMembership() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' as const };
  }

  const membership = await getActiveMembership(user.id);

  if (!membership) {
    return { error: 'Organization not found' as const };
  }

  return { organizationId: membership.organizationId };
}

export async function createProjectAction(
  prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { message: auth.error };
  }

  const rawData = {
    name: formData.get('name'),
    address: formData.get('address') || undefined,
    description: formData.get('description') || undefined,
    plannedStartDate: formData.get('plannedStartDate') || undefined,
    plannedEndDate: formData.get('plannedEndDate') || undefined,
    primaryClientId: formData.get('primaryClientId') || undefined,
  };

  const validated = ProjectSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  let projectId: string;
  try {
    const project = await createProject(auth.organizationId, validated.data);
    projectId = project.id;
  } catch (e) {
    console.error(e);
    return { message: 'Failed to create project' };
  }

  redirect(`/projects/${projectId}`);
}

export type CreateProjectWithClientState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

/**
 * Creates a project together with its client in one step, submitted at the
 * end of the two-step creation wizard (project details -> client). Unlike
 * createProjectAction, this accepts a plain validated object directly from
 * the client component (not FormData), matching the pattern used by
 * createActAction for the equivalent act creation flow.
 */
export async function createProjectWithClientAction(
  data: CreateProjectWithClientRequest,
): Promise<CreateProjectWithClientState> {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { message: auth.error };
  }

  const validated = CreateProjectWithClientSchema.safeParse(data);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  let projectId: string;
  try {
    const project = await createProjectWithClient(
      auth.organizationId,
      validated.data,
    );
    projectId = project.id;
  } catch (e) {
    console.error(e);
    return {
      message:
        e instanceof Error ? e.message : 'Не вдалось створити проєкт',
    };
  }

  redirect(`/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { error: auth.error };
  }

  try {
    await deleteProject(projectId, auth.organizationId);
  } catch (e) {
    console.error(e);
    return { error: 'Не вдалось видалити проєкт' };
  }

  revalidatePath('/projects');
  return { success: true };
}

export async function updateProjectAction(
  projectId: string,
  prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { message: auth.error };
  }

  const rawData = {
    name: formData.get('name'),
    address: formData.get('address') || undefined,
    description: formData.get('description') || undefined,
    status: formData.get('status') || undefined,
    plannedStartDate: formData.get('plannedStartDate') || undefined,
    plannedEndDate: formData.get('plannedEndDate') || undefined,
    primaryClientId: formData.get('primaryClientId') || undefined,
  };

  const validated = ProjectSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    await updateProject(projectId, auth.organizationId, validated.data);
  } catch (e) {
    console.error(e);
    return { message: 'Не вдалось оновити проєкт' };
  }

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function archiveProjectAction(projectId: string) {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { error: auth.error };
  }

  try {
    await archiveProject(projectId, auth.organizationId);
  } catch (e) {
    console.error(e);
    return { error: 'Не вдалось архівувати проєкт' };
  }

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function unarchiveProjectAction(projectId: string) {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { error: auth.error };
  }

  try {
    await unarchiveProject(projectId, auth.organizationId);
  } catch (e) {
    console.error(e);
    return { error: 'Не вдалось відновити проєкт' };
  }

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export type EstimateActionState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

function parseEstimateItemsFromFormData(formData: FormData) {
  const categories = formData.getAll('itemCategory').map(String);
  const names = formData.getAll('itemName').map(String);
  const units = formData.getAll('itemUnit').map(String);
  const quantities = formData.getAll('itemQuantity').map(Number);
  const prices = formData.getAll('itemPrice').map(Number);
  const sources = formData.getAll('itemSource').map(String);
  const sourceDates = formData.getAll('itemSourceDate').map(String);
  const notes = formData.getAll('itemNote').map(String);

  const lengths = [
    categories.length,
    names.length,
    units.length,
    quantities.length,
    prices.length,
    sources.length,
    sourceDates.length,
    notes.length,
  ];
  if (lengths.some((len) => len !== lengths[0])) {
    // Malformed/tampered submission: the parallel arrays must all describe
    // the same set of rows. Fail closed rather than silently zipping
    // mismatched fields together (which would previously rely on Zod's
    // "Required" error for undefined entries as an implicit safety net).
    return [];
  }

  return names.map((name, index) => ({
    category: categories[index] as EstimateCategory,
    name,
    unit: units[index] ?? '',
    quantity: quantities[index],
    price: prices[index],
    source: sources[index] || undefined,
    sourceDate: sourceDates[index] || undefined,
    note: notes[index] || undefined,
  }));
}

export async function createInitialEstimateRevisionAction(
  projectId: string,
  prevState: EstimateActionState,
  formData: FormData,
): Promise<EstimateActionState> {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { message: auth.error };
  }

  const validated = EstimateRevisionInputSchema.safeParse({
    items: parseEstimateItemsFromFormData(formData),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    await createInitialEstimateRevision(
      projectId,
      auth.organizationId,
      validated.data,
    );
  } catch (e) {
    if (e instanceof EstimateConflictError) {
      return { message: e.message };
    }
    console.error(e);
    return { message: 'Не вдалось створити кошторис' };
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function createNextEstimateRevisionAction(
  projectId: string,
  prevState: EstimateActionState,
  formData: FormData,
): Promise<EstimateActionState> {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { message: auth.error };
  }

  const validated = EstimateRevisionInputSchema.safeParse({
    items: parseEstimateItemsFromFormData(formData),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }

  try {
    await createNextEstimateRevision(
      projectId,
      auth.organizationId,
      validated.data,
    );
  } catch (e) {
    if (e instanceof EstimateConflictError) {
      return { message: e.message };
    }
    console.error(e);
    return { message: 'Не вдалось оновити кошторис' };
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function agreeEstimateRevisionAction(
  projectId: string,
  revisionId: string,
) {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { error: auth.error };
  }

  try {
    await agreeEstimateRevision(revisionId, projectId, auth.organizationId);
  } catch (e) {
    if (e instanceof EstimateConflictError) {
      return { error: e.message };
    }
    console.error(e);
    return { error: 'Не вдалось погодити кошторис' };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectEstimateAction(projectId: string) {
  const auth = await requireOrganizationMembership();
  if ('error' in auth) {
    return { error: auth.error };
  }

  try {
    await deleteProjectEstimate(projectId, auth.organizationId);
  } catch (e) {
    console.error(e);
    return { error: 'Не вдалось видалити кошторис' };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
