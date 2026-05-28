'use client';

import Image from 'next/image';
import { Menu } from 'react-feather';

import { useSidebar } from '@/shared/providers/SidebarProvider';
import { ProfileDropdown } from '@/components/widgets/profile/ProfileDropdown';

export default function Header() {
  const { open: openSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 lg:px-8">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Burger — mobile only */}
        <button
          onClick={openSidebar}
          className="p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Відкрити меню"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right side — avatar with dropdown */}
      <ProfileDropdown />
    </header>
  );
}
