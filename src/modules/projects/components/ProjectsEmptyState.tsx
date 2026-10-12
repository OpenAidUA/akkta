import { Button } from '@/shared/ui/button';
import { Plus, Folder } from 'react-feather';
import Link from 'next/link';
import EmptyPagePlaceholder from '@/shared/components/EmptyPage';

export function ProjectsEmptyState() {
  return (
    <EmptyPagePlaceholder
      icon={<Folder size={24} color="black" />}
      title="Проєктів ще не додано"
      descr="Створіть проєкт, щоб групувати акти та кошторис одного будівельного об'єкту."
    >
      <Link href="/projects/create">
        <Button
          className="bg-linear-to-r from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] text-white shadow-md transition-color duration-700 active:scale-95 gap-2"
          aria-label="Add Project"
        >
          <Plus size={18} />
          Додати проєкт
        </Button>
      </Link>
    </EmptyPagePlaceholder>
  );
}
