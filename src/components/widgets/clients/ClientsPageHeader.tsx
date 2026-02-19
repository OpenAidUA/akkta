import { Button } from '@/components/ui/button';
import { Plus } from 'react-feather';
import Link from 'next/link';

interface ClientsPageHeaderProps {
  hasAnyClients: boolean;
}

export function ClientsPageHeader({ hasAnyClients }: ClientsPageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-slate-900">Клієнти</h1>
      {hasAnyClients && (
        <Link href="/clients/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={18} />
            Додати клієнта
          </Button>
        </Link>
      )}
    </div>
  );
}
