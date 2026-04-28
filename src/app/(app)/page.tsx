import { Home } from 'react-feather';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { getDashboardStats, getRecentActs } from '@/modules/dashboard/service';
import { getOrganizationByUserId } from '@/modules/organizations/service';
import { StatCards } from '@/components/widgets/dashboard/StatCards';
import { RecentActs } from '@/components/widgets/dashboard/RecentActs';
import { QuickActions } from '@/components/widgets/dashboard/QuickActions';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [stats, recentActs, org] = await Promise.all([
    getDashboardStats(user.id),
    getRecentActs(user.id, 6),
    getOrganizationByUserId(user.id),
  ]);

  const hasOrganizationData = !!(org?.name && org?.representative);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <Home size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Дашборд</h1>
          <p className="text-sm text-slate-500">
            Огляд вашої активності та швидкий доступ
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <StatCards stats={stats} />

      {/* Main content: Recent acts + Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActs acts={recentActs} />
        </div>
        <div>
          <QuickActions
            draftsCount={stats.draftsCount}
            hasOrganizationData={hasOrganizationData}
          />
        </div>
      </div>
    </div>
  );
}
