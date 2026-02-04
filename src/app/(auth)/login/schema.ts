import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Невірна електронна адреса'),
  password: z.string().min(10, 'Пароль повинен містити щонайменше 10 символів'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
