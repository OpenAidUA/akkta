'use server';

import { createSupabaseServerClient } from '@/shared/supabase/server';
import { SendCodeState, VerifyCodeState, UpdatePasswordState } from './types';

import {
  recoveryEmailSchema,
  recoveryPasswordSchema,
  recoveryTokenSchema,
} from './schema';

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
