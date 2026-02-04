'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/shared/superbase/client';

type AuthContextType = {
  user: User | null;
  userName: string;
  orgName: string;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  user: initialUser,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Keep user sync with supabase auth state
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? '';
  const orgName =
    (user?.user_metadata?.organization_name as string | undefined) ?? '';

  return (
    <AuthContext.Provider value={{ user, userName, orgName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
}
