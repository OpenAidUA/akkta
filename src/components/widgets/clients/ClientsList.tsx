import { Button } from '@/components/ui/button';
import { Edit2 } from 'react-feather';

import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { DeleteClientButton } from '@/components/widgets/clients/DeleteClientButton';

interface ClientsListProps {
  clients: Array<{
    id: string;
    name: string;
    edrpou?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    createdAt: string;
    _count: {
      acts: number;
    };
  }>;
  searchQuery: string;
}

const ClientsList: React.FC<ClientsListProps> = ({ clients, searchQuery }) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-left">
          <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Назва
          </th>
          <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
            ЄДРПОУ / ІПН
          </th>
          <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Контакт
          </th>
          <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Email
          </th>
          <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Телефон
          </th>
          <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center">
            Акти
          </th>
          <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Додано
          </th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        {clients.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
              Нічого не знайдено за запитом «{searchQuery}»
            </td>
          </tr>
        ) : (
          clients.map((client) => (
            <tr
              key={client.id}
              className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
            >
              <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                {client.name}
              </td>
              <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                {client.edrpou || '—'}
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                {client.contactName || '—'}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {client.email || '—'}
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                {client.phone || '—'}
              </td>
              <td className="px-4 py-3 text-center">
                {client._count.acts > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                    {client._count.acts}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                {formatDistanceToNow(new Date(client.createdAt), {
                  addSuffix: true,
                  locale: uk,
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Link href={`/clients/${client.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                    >
                      <Edit2 size={14} className="text-slate-500" />
                    </Button>
                  </Link>
                  <DeleteClientButton
                    clientId={client.id}
                    clientName={client.name}
                  />
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ClientsList;
