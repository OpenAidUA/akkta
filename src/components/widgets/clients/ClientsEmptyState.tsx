import { Button } from '@/components/ui/button';
import { Plus } from 'react-feather';
import Link from 'next/link';
import EmptyPagePlaceholder from '@/shared/components/EmptyPage';
import { Users } from 'react-feather';

interface ClientsEmptyStateProps {
  onAddClient?: () => void;
}

export function ClientsEmptyState({ onAddClient }: ClientsEmptyStateProps) {
  return (
    <EmptyPagePlaceholder
      icon={<Users size={24} color="black" />}
      title="Клієнтів ще не додано"
      descr="Додайте своїх клієнтів, щоб пришвидшити створення документів."
    >
      <Link href="/clients/create">
        <Button
          className="bg-linear-to-r from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] text-white shadow-md transition-color duration-700 active:scale-95 gap-2"
          aria-label="Add Client"
          onClick={onAddClient}
        >
          <Plus size={18} />
          Додати клієнта
        </Button>
      </Link>
    </EmptyPagePlaceholder>
  );
}
