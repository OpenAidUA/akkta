import { Button } from '@/shared/ui/button';
import { Plus } from 'react-feather';
import Link from 'next/link';

interface ProjectsPageHeaderProps {
  hasAnyProjects: boolean;
}

export function ProjectsPageHeader({
  hasAnyProjects,
}: ProjectsPageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-slate-900">Проєкти</h1>
      {hasAnyProjects && (
        <Link href="/projects/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={18} />
            Додати проєкт
          </Button>
        </Link>
      )}
    </div>
  );
}
