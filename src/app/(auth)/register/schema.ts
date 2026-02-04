import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Ім'я повинно бути не менше 2 символів"),
  organizationName: z
    .string()
    .min(2, 'Назва організації повинна містити щонайменше 2 символи'),
  email: z.string().email('Невірна електронна адреса'),
  password: z.string().min(10, 'Пароль повинен містити щонайменше 10 символів'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
