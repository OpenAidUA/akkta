'use client';

import { User, Lock, Shield, LogOut } from 'react-feather';

import Link from 'next/link';

import { useAuth } from '@/shared/providers/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ProfileDropdown = () => {
  const { userName, orgName, signOut } = useAuth();

  const initials = getInitials(userName || 'U');

  return (
    <div className="flex items-center gap-3 relative">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium text-slate-900 leading-tight">
          {userName || 'User'}
        </p>
        {orgName && (
          <p className="text-xs text-slate-400 leading-tight">{orgName}</p>
        )}
      </div>

      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Открыть меню профиля"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              align="end"
              sideOffset={16}
              className="min-w-48 bottom-10 bg-white rounded-md shadow-lg border border-slate-200 p-1"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-md text-gray-400 flex gap-2 p-2 border-transparen hover:bg-accent/10 focus-visible:border-none">
                  <User size={22} />
                  <Link href="/settings" className="text-sm text-slate-600">
                    Налаштування
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-md text-gray-400  flex gap-2 p-2 border-transparen hover:bg-accent/10">
                  <Lock size={22} />
                  <Link href="/privacy" className="text-sm  text-slate-600">
                    Політика конфіденційності
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-md text-gray-400  flex gap-2 p-2 border-transparen hover:bg-accent/10">
                  <Shield size={22} />
                  <Link href="/terms" className="text-sm  text-slate-600">
                    Умови використання
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="h-px my-1 bg-slate-200" />
              <DropdownMenuItem className="rounded-md text-gray-400  border-transparen hover:bg-accent/10">
                <button
                  type="button"
                  className="text-sm flex gap-2 p-2 cursor-pointer text-slate-600"
                  onClick={signOut}
                >
                  <LogOut size={22} />
                  Вийти
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>
    </div>
  );
};
