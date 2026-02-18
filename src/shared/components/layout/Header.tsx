'use client';

import React from 'react';
import Image from 'next/image';
import { Menu } from 'react-feather';
import { useSidebar } from '@/shared/providers/SidebarProvider';
import { useAuth } from '@/shared/providers/AuthProvider';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Header() {
  const { open } = useSidebar();
  const { userName, orgName } = useAuth();

  const initials = getInitials(userName || 'U');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 lg:px-8">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Burger — mobile only */}
        <button
          onClick={open}
          className="p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Відкрити меню"
        >
          <Menu size={22} />
        </button>
        {/* Logo — mobile only (desktop has it in sidebar) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Image width={28} height={28} src="/logo.png" alt="logo" />
          <span className="font-semibold text-slate-900">Clarus Acts</span>
        </div>
      </div>

      {/* Right side — avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-slate-900 leading-tight">
            {userName || 'User'}
          </p>
          {orgName && (
            <p className="text-xs text-slate-400 leading-tight">{orgName}</p>
          )}
        </div>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          title={userName || 'User'}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
