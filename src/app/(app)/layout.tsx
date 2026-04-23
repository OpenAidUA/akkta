import { redirect } from 'next/navigation';
import {
  DesktopSidebar,
  MobileSidebar,
} from '@/shared/components/layout/Sidebar';
import Header from '@/shared/components/layout/Header';
import { createSupabaseServerClient } from '@/shared/superbase/server';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { SidebarProvider } from '@/shared/providers/SidebarProvider';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthProvider user={user ?? null}>
      <SidebarProvider>
        <div className="flex min-h-dvh">
          {user ? (
            <>
              {/* Desktop sidebar — hidden on mobile */}
              <DesktopSidebar />
              {/* Mobile sidebar — overlay, hidden on desktop */}
              <MobileSidebar />

              {/* Main area with sidebar */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header — always visible */}
                <Header />

                <main className="flex-1">
                  <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
                    {children}
                  </div>
                </main>
              </div>
            </>
          ) : (
            /* Public layout (no sidebar) */
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
                  {children}
                </div>
              </main>
            </div>
          )}
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
