'use client';

import { Home, FileText, User, X, LogOut } from 'react-feather';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useSidebar } from '@/shared/providers/SidebarProvider';
import { useEffect } from 'react';

const nav = [
  { name: 'Дашборд', href: '/', icon: <Home size={24} /> },
  { name: 'Акти', href: '/acts', icon: <FileText size={24} /> },
  { name: 'Клієнти', href: '/clients', icon: <User size={24} /> },
];

function SidebarContent() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { close } = useSidebar();

  return (
    <>
      <div className="flex items-center justify-between px-6 py-5 mb-4">
        <div className="flex gap-3 items-center">
          <Image width={50} height={50} src="/logo.png" alt="logo" />
          <p className="text-xl font-bold">Clarus Acts</p>
        </div>
        <button
          onClick={close}
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Закрити меню"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={twMerge(
                'flex items-center gap-2 rounded-2xl px-3 py-2 text-lg font-medium transition-colors',
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

      {/* Logout */}
      <div className="border-t border-slate-800 px-4 py-4">
        <button
          className="flex items-center gap-2 text-lg cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
          onClick={signOut}
          type="button"
        >
          <LogOut size={24} />
          Вийти
        </button>
      </div>
    </>
  );
}

/** Desktop sidebar — always visible on lg+ */
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-70 flex-col bg-sidebar text-slate-200 h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}

/** Mobile sidebar — slide-in overlay */
export function MobileSidebar() {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={twMerge(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={twMerge(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar text-slate-200 transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

/** Legacy export for backward compat */
export function Sidebar() {
  return <DesktopSidebar />;
}
