import React from 'react';
import Link from 'next/link';
import { Client, Project } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';

type ProjectRow = Project & {
  primaryClient: Client | null;
  _count: { acts: number };
};

interface ProjectsListProps {
  projects: ProjectRow[];
  searchQuery: string;
}

const STATUS_LABEL: Record<Project['status'], string> = {
  active: 'Активний',
  archived: 'Архівний',
};

const STATUS_CLASS: Record<Project['status'], string> = {
  active: 'bg-green-50 text-green-700',
  archived: 'bg-slate-100 text-slate-500',
};

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  searchQuery,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Назва
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Адреса
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Замовник
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center">
                Акти
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Додано
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  Нічого не знайдено за запитом «{searchQuery}»
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                    <Link
                      href={`/projects/${project.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {project.address || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {project.primaryClient?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {project._count.acts > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                        {project._count.acts}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[project.status]}`}
                    >
                      {STATUS_LABEL[project.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                      locale: uk,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsList;
