import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
  CreateProjectRequest,
  EstimateRevisionInput,
  UpdateProjectRequest,
} from './domain';
import {
  normalizePage,
  PAGE_SIZE,
  type PaginatedResult,
} from '@/lib/pagination';

export interface GetProjectsOptions {
  search?: string;
  status?: 'active' | 'archived';
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

function getProjectsWhere(
  organizationId: string,
  search?: string,
  status?: 'active' | 'archived',
): Prisma.ProjectWhereInput {
  const normalizedSearch = search?.trim();

  return {
    organizationId,
    ...(status ? { status } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            {
              name: {
                contains: normalizedSearch,
                mode: 'insensitive' as const,
              },
            },
            {
              address: {
                contains: normalizedSearch,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: normalizedSearch,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  };
}

function parsePlannedDate(value?: string): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getOrganizationProjects(
  organizationId: string,
  options: GetProjectsOptions = {},
) {
  const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  return prisma.project.findMany({
    where: getProjectsWhere(organizationId, search, status),
    orderBy: [{ [sortBy]: sortOrder }, { id: 'desc' }],
    include: {
      primaryClient: true,
      _count: { select: { acts: true } },
    },
  });
}

export async function getPaginatedOrganizationProjects(
  organizationId: string,
  options: GetProjectsOptions = {},
) {
  const {
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page: requestedPage = 1,
  } = options;
  const where = getProjectsWhere(organizationId, search, status);
  const total = await prisma.project.count({ where });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const page =
    totalPages === 0 ? 1 : Math.min(normalizePage(requestedPage), totalPages);

  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ [sortBy]: sortOrder }, { id: 'desc' }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      primaryClient: true,
      _count: { select: { acts: true } },
    },
  });

  return {
    items: projects,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
  } satisfies PaginatedResult<(typeof projects)[number]>;
}

export async function getProjectById(
  projectId: string,
  organizationId: string,
) {
  return await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
    include: {
      primaryClient: true,
      _count: { select: { acts: true } },
    },
  });
}

/**
 * Aggregated stats for a project detail view (acts by status + document sum).
 * Kept as a separate query so the detail page can render stats and lists
 * independently without over-fetching on the list/paginated queries above.
 *
 * `actsDocumentTotal` is the sum of amounts recorded on act documents. It is
 * NOT a payment or confirmed revenue figure — it only reflects what has been
 * documented on issued acts, regardless of client payment status.
 */
export async function getProjectStats(
  projectId: string,
  organizationId: string,
) {
  const acts = await prisma.act.findMany({
    where: { projectId, organizationId },
    select: { status: true, data: true },
  });

  const actsByStatusMap = new Map<string, number>();
  let actsDocumentTotal = 0;

  for (const act of acts) {
    actsByStatusMap.set(act.status, (actsByStatusMap.get(act.status) ?? 0) + 1);
    const total = (act.data as { totals?: { total?: number } } | null)?.totals
      ?.total;
    if (typeof total === 'number' && Number.isFinite(total)) {
      actsDocumentTotal += total;
    }
  }

  return {
    actsCount: acts.length,
    actsByStatus: Array.from(actsByStatusMap.entries()).map(
      ([status, count]) => ({ status, count }),
    ),
    actsDocumentTotal,
  };
}

export async function getProjectActs(
  projectId: string,
  organizationId: string,
) {
  return prisma.act.findMany({
    where: { projectId, organizationId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: { client: true },
  });
}

export async function createProject(
  organizationId: string,
  data: CreateProjectRequest,
) {
  if (data.primaryClientId) {
    const client = await prisma.client.findFirst({
      where: { id: data.primaryClientId, organizationId },
      select: { id: true },
    });
    if (!client) {
      throw new Error('Client not found');
    }
  }

  return await prisma.project.create({
    data: {
      organizationId,
      name: data.name,
      address: data.address,
      description: data.description,
      status: data.status,
      plannedStartDate: parsePlannedDate(data.plannedStartDate) || undefined,
      plannedEndDate: parsePlannedDate(data.plannedEndDate) || undefined,
      primaryClientId: data.primaryClientId,
    },
  });
}

export async function updateProject(
  projectId: string,
  organizationId: string,
  data: UpdateProjectRequest,
) {
  if (data.primaryClientId) {
    const client = await prisma.client.findFirst({
      where: { id: data.primaryClientId, organizationId },
      select: { id: true },
    });
    if (!client) {
      throw new Error('Client not found');
    }
  }

  return await prisma.project.update({
    where: {
      id: projectId,
      organizationId,
    },
    data: {
      name: data.name,
      address: data.address,
      description: data.description,
      status: data.status,
      plannedStartDate: parsePlannedDate(data.plannedStartDate),
      plannedEndDate: parsePlannedDate(data.plannedEndDate),
      primaryClientId: data.primaryClientId ?? null,
    },
  });
}

/**
 * Archives a project. This is the standard way to mark a construction object
 * as finished — it preserves all data and relations, unlike deleteProject.
 */
export async function archiveProject(
  projectId: string,
  organizationId: string,
) {
  return await prisma.project.update({
    where: { id: projectId, organizationId },
    data: { status: 'archived' },
  });
}

export async function unarchiveProject(
  projectId: string,
  organizationId: string,
) {
  return await prisma.project.update({
    where: { id: projectId, organizationId },
    data: { status: 'active' },
  });
}

/**
 * Deletes a project. Related acts are detached (projectId set to NULL) by the
 * database FK constraint (ON DELETE SET NULL) defined in the migration, so no
 * explicit detach step is required here. The estimate (and its revisions/items)
 * is owned by the project and is cascade-deleted with it.
 *
 * Prefer archiveProject for normal project completion; this is a destructive,
 * explicit action intended for correcting mistakes, not finishing work.
 */
export async function deleteProject(projectId: string, organizationId: string) {
  return await prisma.project.delete({
    where: {
      id: projectId,
      organizationId,
    },
  });
}

/**
 * Reassigns an act to a different project (or unassigns it by passing null).
 * Not exposed via UI yet, but the schema/service support moving acts between
 * projects going forward without further migrations. Verifies the target
 * project belongs to the same organization to prevent cross-tenant linkage.
 */
export async function reassignActProject(
  actId: string,
  organizationId: string,
  projectId: string | null,
) {
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
      select: { id: true },
    });
    if (!project) {
      throw new Error('Project not found');
    }
  }

  return await prisma.act.update({
    where: { id: actId, organizationId },
    data: { projectId },
  });
}

// ---------------------------------------------------------------------------
// Estimate (simplified project budget with revision history)
// ---------------------------------------------------------------------------

/**
 * Loads the estimate for a project together with all revisions ordered by
 * version (latest first) and their items. Returns null if no estimate has
 * been started yet.
 */
export async function getProjectEstimate(
  projectId: string,
  organizationId: string,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true },
  });
  if (!project) return null;

  return prisma.estimate.findUnique({
    where: { projectId },
    include: {
      revisions: {
        orderBy: { version: 'desc' },
        include: { items: { orderBy: { order: 'asc' } } },
      },
    },
  });
}

/**
 * Returns the current revision of a project's estimate: the highest-versioned
 * revision. There is exactly one "current" revision at any time by
 * construction (revisions are only ever appended, never reordered).
 */
export async function getCurrentEstimateRevision(
  projectId: string,
  organizationId: string,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true },
  });
  if (!project) return null;

  const estimate = await prisma.estimate.findUnique({ where: { projectId } });
  if (!estimate) return null;

  return prisma.estimateRevision.findFirst({
    where: { estimateId: estimate.id },
    orderBy: { version: 'desc' },
    include: { items: { orderBy: { order: 'asc' } } },
  });
}

/**
 * Thrown when a concurrent request already created a conflicting estimate
 * revision (or the initial estimate) for the same project. Callers should
 * surface a "please retry" message rather than a generic failure.
 */
export class EstimateConflictError extends Error {
  constructor(message = 'Кошторис було змінено паралельно, спробуйте ще раз') {
    super(message);
    this.name = 'EstimateConflictError';
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

/**
 * Retries a serializable transaction a few times when Postgres reports a
 * serialization failure (40001) or a unique-constraint race (P2002), both of
 * which can legitimately happen when two requests read the same "latest
 * version" concurrently and then try to insert the next one.
 */
async function runSerializableWithRetry<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  attempts = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const isSerializationFailure =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034';
      const isConflict = isSerializationFailure || isUniqueConstraintError(error);

      if (!isConflict || attempt === attempts) {
        if (isConflict) {
          throw new EstimateConflictError();
        }
        throw error;
      }
      // Small jittered backoff before retrying.
      await new Promise((resolve) =>
        setTimeout(resolve, 25 * attempt + Math.random() * 25),
      );
    }
  }
  // Unreachable, but keeps TypeScript happy.
  throw new EstimateConflictError();
}

function calculateItemAmounts(items: EstimateRevisionInput['items']) {
  return items.map((item, index) => {
    const amount = Math.round(item.quantity * item.price * 100) / 100;
    return {
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      amount,
      order: index,
    };
  });
}

/**
 * Creates the first draft revision (version 1) for a project's estimate.
 * Fails if an estimate already exists for the project — use
 * createNextEstimateRevision to add further revisions instead.
 */
export async function createInitialEstimateRevision(
  projectId: string,
  organizationId: string,
  data: EstimateRevisionInput,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true },
  });
  if (!project) {
    throw new Error('Project not found');
  }

  const items = calculateItemAmounts(data.items);

  return runSerializableWithRetry(async (tx) => {
    // Re-check inside the transaction: with Serializable isolation this
    // guards against two concurrent "first submit" requests both seeing no
    // estimate and both trying to create one (unique on Estimate.projectId).
    const existing = await tx.estimate.findUnique({ where: { projectId } });
    if (existing) {
      throw new EstimateConflictError('Кошторис вже створено, оновіть сторінку');
    }

    return tx.estimate.create({
      data: {
        projectId,
        revisions: {
          create: {
            version: 1,
            status: 'draft',
            items: { create: items },
          },
        },
      },
      include: {
        revisions: { include: { items: true } },
      },
    });
  });
}

/**
 * Creates a new draft revision by copying forward from the current one and
 * applying the provided items. A revision that is already `agreed` is never
 * mutated in place — this is the only supported way to change an agreed
 * estimate, preserving full history for past acts generated from it.
 */
export async function createNextEstimateRevision(
  projectId: string,
  organizationId: string,
  data: EstimateRevisionInput,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true },
  });
  if (!project) {
    throw new Error('Project not found');
  }

  const items = calculateItemAmounts(data.items);

  return runSerializableWithRetry(async (tx) => {
    const estimate = await tx.estimate.findUnique({ where: { projectId } });
    if (!estimate) {
      throw new Error('Estimate not found');
    }

    const latest = await tx.estimateRevision.findFirst({
      where: { estimateId: estimate.id },
      orderBy: { version: 'desc' },
      select: { version: true, status: true },
    });

    if (latest && latest.status !== 'agreed') {
      throw new EstimateConflictError(
        'Поточну версію кошторису ще не погоджено',
      );
    }

    const nextVersion = (latest?.version ?? 0) + 1;

    return tx.estimateRevision.create({
      data: {
        estimateId: estimate.id,
        version: nextVersion,
        status: 'draft',
        items: { create: items },
      },
      include: { items: true },
    });
  });
}

/**
 * Marks the current (latest) draft revision as agreed. Agreed revisions are
 * immutable going forward; any further change must go through
 * createNextEstimateRevision.
 *
 * Runs inside a serializable transaction and verifies the target revision is
 * still the newest one for its estimate — this prevents agreeing a stale
 * revision if a newer one was created concurrently (e.g. a second tab/user)
 * between the page load and the "agree" click.
 */
export async function agreeEstimateRevision(
  revisionId: string,
  projectId: string,
  organizationId: string,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true },
  });
  if (!project) {
    throw new Error('Project not found');
  }

  return runSerializableWithRetry(async (tx) => {
    const revision = await tx.estimateRevision.findFirst({
      where: { id: revisionId, estimate: { projectId } },
      select: { id: true, status: true, version: true, estimateId: true },
    });
    if (!revision) {
      throw new Error('Estimate revision not found');
    }
    if (revision.status === 'agreed') {
      return revision;
    }

    const latest = await tx.estimateRevision.findFirst({
      where: { estimateId: revision.estimateId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    if (latest && latest.version !== revision.version) {
      throw new EstimateConflictError(
        'З\'явилась новіша версія кошторису, оновіть сторінку',
      );
    }

    return tx.estimateRevision.update({
      where: { id: revisionId },
      data: { status: 'agreed' },
    });
  });
}
