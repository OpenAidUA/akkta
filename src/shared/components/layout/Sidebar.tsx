import { createSupabaseServerClient } from '@/shared/superbase/server';
import { SidebarClient } from './SidebarClient';

export async function Sidebar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    '';
  const orgName =
    (user?.user_metadata?.organization_name as string | undefined) ?? '';

  return <SidebarClient userName={userName} orgName={orgName} />;
}
