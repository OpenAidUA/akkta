'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/supabase/server';
import {
  loginSchema,
  recoveryEmailSchema,
  recoveryPasswordSchema,
  recoveryTokenSchema,
  registerSchema,
} from './schema';
import {
  LoginState,
  SendCodeState,
  VerifyCodeState,
  UpdatePasswordState,
  RegisterState,
} from './types';

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

export async function sendRecoveryCodeAction(
  prevState: SendCodeState,
  formData: FormData,
): Promise<SendCodeState> {
  const validatedFields = recoveryEmailSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Невірна електронна адреса.',
    };
  }

  const { email } = validatedFields.data;
  const supabase = await createSupabaseServerClient();

  const res = await supabase.auth.resetPasswordForEmail(email);

  if (res.error) {
    console.error('resetPasswordForEmail error:', res.error);
  }

  return {
    success: true,
    message: 'Якщо такий email зареєстровано, код надіслано на пошту.',
  };
}

export async function verifyRecoveryCodeAction(
  prevState: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const validatedFields = recoveryTokenSchema.safeParse({
    email: formData.get('email'),
    token: formData.get('token'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Невірний код.',
    };
  }

  const { email, token } = validatedFields.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  });

  if (error) {
    return {
      errors: { _form: [error.message] },
      message: 'Невірний або прострочений код. Спробуйте ще раз.',
    };
  }

  return { success: true, message: 'Код підтверджено.' };
}

export async function updateRecoveryPasswordAction(
  prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const validatedFields = await recoveryPasswordSchema.safeParseAsync({
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Невірний пароль.',
    };
  }

  const { password } = validatedFields.data;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      errors: {
        _form: ['Сесія відновлення пароля недійсна. Почніть спочатку.'],
      },
      message: 'Сесія недійсна.',
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      errors: { _form: [error.message] },
      message: 'Не вдалося оновити пароль.',
    };
  }

  await supabase.auth.signOut({ scope: 'others' });

  return { success: true, message: 'Пароль успішно змінено.' };
}

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
