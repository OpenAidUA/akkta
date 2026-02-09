import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import CreateClientForm from '@/components/forms/createClient/CreateClientForm';

export default function CreateClientPage() {
  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-6">
        <Link
          href="/clients"
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад до списку
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Новий клієнт</h1>
      </div>

      <CreateClientForm />
    </div>
  );
}
