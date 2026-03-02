import { Settings } from 'react-feather';
import { getOrganizationByUserId } from '@/modules/organizations/service';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const org = await getOrganizationByUserId(user.id);

  if (!org) {
    return (
      <div className="max-w-2xl mx-auto pt-10 px-4">
        <p className="text-slate-500">Організацію не знайдено.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Settings size={20} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Налаштування</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">
          Дані організації, що відображаються у ваших актах
        </p>
      </div>

      <SettingsForm
        defaultValues={{
          name: org.name,
          edrpou: org.edrpou ?? '',
          representative: org.representative ?? '',
        }}
      />
    </div>
  );
}
