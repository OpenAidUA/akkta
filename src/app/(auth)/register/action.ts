'use server';

import { createSupabaseServerClient } from '@/shared/supabase/server';

import { registerSchema } from './schema';
import { redirect } from 'next/navigation';
import { RegisterState } from './types';

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

  const supabase = await createSupabaseServerClient();

  const { error: authError } = await supabase.auth.signUp({
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
