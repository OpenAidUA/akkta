import { createSupabaseServerClient } from '@/shared/superbase/server';
import { getActById } from '@/modules/acts/service';
import { redirect } from 'next/navigation';
import ActDetailView from './ActDetailView';

export const dynamic = 'force-dynamic';

interface ActDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActDetailPage({ params }: ActDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const act = await getActById(id, user.id);

  if (!act) {
    redirect('/acts');
  }

  return <ActDetailView act={act} />;
}
