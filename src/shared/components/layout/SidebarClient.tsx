'use client';

import { Home, FileText, User } from 'react-feather';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/shared/superbase/client';

const nav = [
  { name: 'Дашборд', href: '/', icon: <Home size={16} /> },
  { name: 'Акти', href: '/acts', icon: <FileText size={16} /> },
  { name: 'Клієнти', href: '/clients', icon: <User size={16} /> },
];

type SidebarClientProps = {
  userName?: string;
  orgName?: string;
};

export function SidebarClient({ userName, orgName }: SidebarClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="flex w-70 flex-col bg-sidebar text-slate-200">
      <div className="flex gap-3 px-6 py-5 items-center mb-4">
        <Image width={40} height={40} src="/logo.png" alt="logo" />
        <p className="text-xl font-bold">Clarus Acts</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                'flex items-center gap-2 rounded-2xl px-3 py-2 text-md font-medium transition-colors',
                'text-gray-400 hover:bg-slate-800 hover:text-white',
                isActive && 'bg-sidebar-accent text-white shadow-sm',
              )}
            >
              <span className="p-1 rounded-full bg-accent">{item.icon}</span>

              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 px-4 py-4 text-sm">
        <div className="font-medium">{userName || 'User'}</div>
        <div className="text-xs text-slate-400">{orgName || '—'}</div>

        <button
          className="mt-3 text-xs text-slate-400 hover:text-slate-200"
          onClick={handleLogout}
          type="button"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
