import { z } from 'zod';

import { isPasswordPwned } from '@/modules/auth/pwned-password';

export const registerSchema = z.object({
  name: z.string().min(2, "Ім'я повинно бути не менше 2 символів"),
  organizationName: z
    .string()
    .min(2, 'Назва організації повинна містити щонайменше 2 символи'),
  email: z.string().email('Невірна електронна адреса'),
  password: z
    .string()
    .min(10, 'Пароль повинен містити щонайменше 10 символів')
    .refine(
      async (password) => {
        if (password.length < 10) return true;

        const isPwned = await isPasswordPwned(password);

        return !isPwned;
      },
      {
        message:
          'Цей пароль знайдено в базах витоків даних. Будь ласка, оберіть інший.',
      },
    ),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
