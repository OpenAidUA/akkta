import { redirect } from 'next/navigation';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { createSupabaseServerClient } from '@/shared/superbase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen">
      <Sidebar />
      <main className="w-full">
        <div className="max-w-7xl mx-auto p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
