'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { registerSchema } from './schema';
import { redirect } from 'next/navigation';

export type RegisterState = {
  errors?: {
    name?: string[];
    organizationName?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  message?: string;
} | null;

export async function registerAction(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const validatedFields = await registerSchema.safeParseAsync({
    name: formData.get('name'),
    organizationName: formData.get('organizationName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Невірні поля. Не вдалося зареєструватися.',
    };
  }

  const { email, password, name, organizationName } = validatedFields.data;
  const cookieStore = await cookies();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    console.error('Missing Supabase env vars', {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    });
    return {
      errors: {
        _form: ['Server configuration error. Contact administrator.'],
      },
      message: 'Server configuration error.',
    };
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`,
      data: {
        full_name: name,
        organization_name: organizationName,
      },
    },
  });

  if (authError) {
    console.error('Supabase signUp error:', authError);
    return {
      errors: {
        _form: [authError.message || 'Unknown error'],
      },
      message: 'Сталась помилка при створенні користувача.',
    };
  }

  // Redirect on success
  redirect('/');
}
