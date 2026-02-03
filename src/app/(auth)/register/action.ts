'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { registerSchema } from './schema';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

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
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    organizationName: formData.get('organizationName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to register.',
    };
  }

  const { email, password, name, organizationName } = validatedFields.data;
  const cookieStore = await cookies();

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
    return {
      errors: {
        _form: [authError.message],
      },
      message: 'Failed to create user in Supabase.',
    };
  }

  if (!authData.user) {
    return {
      errors: {
        _form: ['Something went wrong. No user returned.'],
      },
      message: 'Registration warning.',
    };
  }

  const userId = authData.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          id: userId,
          name,
          email,
        },
      });

      // Create Organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      });

      return { user, organization };
    });
  } catch (error) {
    console.error('Prisma registration error:', error);
    // Ideally, we should rollback Supabase user creation here if possible,
    // but without Service Role key/Admin API we can't easily delete the auth user.
    // In a production app, we might use a cleanup job or call an admin endpoint.
    return {
      errors: {
        _form: ['Failed to create account data. Please try again.'],
      },
      message: 'Database error.',
    };
  }

  // After successful registration, sign in the user to establish session
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Registration succeeded but auto-login failed, redirect to login page
    redirect('/login?message=Registration successful. Please log in.');
  }

  // Redirect on success
  redirect('/');
}
