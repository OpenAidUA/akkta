import { getPaginatedOrganizationProjects } from '@/modules/projects/service';
import { createSupabaseServerClient } from '@/shared/supabase/server';
import { prisma } from '@/lib/db';
import { getActiveMembership } from '@/modules/organizations/service';
import { ProjectsToolbar } from '@/modules/projects/components/ProjectsToolbar';
import ProjectsList from '@/modules/projects/components/ProjectsList';
import { ProjectsEmptyState } from '@/modules/projects/components/ProjectsEmptyState';
import { ProjectsPageHeader } from '@/modules/projects/components/ProjectsPageHeader';
import { parsePage } from '@/lib/pagination';
import { PaginationControls } from '@/shared/components/PaginationControls';

interface ProjectsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { q, status, sort, order, page: pageParam } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const membership = await getActiveMembership(user.id);

  const sortBy = sort === 'name' ? 'name' : 'createdAt';
  const sortOrder =
    order === 'asc'
      ? 'asc'
      : order === 'desc'
        ? 'desc'
        : sortBy === 'name'
          ? 'asc'
          : 'desc';
  const statusFilter =
    status === 'active' || status === 'archived' ? status : undefined;

  const projects = membership
    ? await getPaginatedOrganizationProjects(membership.organizationId, {
        search: q,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: parsePage(pageParam),
      })
    : { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 };

  const hasAnyProjects = membership
    ? (await prisma.project.count({
        where: { organizationId: membership.organizationId },
      })) > 0
    : false;

  return (
    <>
      <ProjectsPageHeader hasAnyProjects={hasAnyProjects} />

      {!hasAnyProjects ? (
        <ProjectsEmptyState />
      ) : (
        <>
          <ProjectsToolbar
            search={q ?? ''}
            status={statusFilter ?? 'all'}
            sortBy={sortBy}
            sortOrder={sortOrder}
            total={projects.total}
          />

          <ProjectsList projects={projects.items} searchQuery={q || ''} />
          <PaginationControls
            page={projects.page}
            totalPages={projects.totalPages}
            pathname="/projects"
            searchParams={{ q, status, sort, order }}
          />
        </>
      )}
    </>
  );
}
