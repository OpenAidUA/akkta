'use server';

import { createSupabaseServerClient } from '@/shared/supabase/server';
import { loginSchema } from './schema';
import { redirect } from 'next/navigation';

import { LoginState } from './types';

export async function loginAction(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Невірні поля. Не вдалося увійти.',
    };
  }

  const { email, password } = validatedFields.data;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      errors: {
        _form: [error.message],
      },
      message: 'Сталась помилка при вході. Спробуйте ще раз.',
    };
  }

  redirect('/');
}
