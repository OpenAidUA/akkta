'use client';
import Image from 'next/image';
import { Button, Input, Label } from '@/components/ui';
import { useActionState, startTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAction } from './action';
import { registerSchema, type RegisterSchema } from './schema';

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(registerAction, null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = (data: RegisterSchema) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('organizationName', data.organizationName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      action(formData);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-3 px-6 py-5 items-center">
          <Image width={40} height={40} src="/logo.png" alt="logo" />
          <p className="text-xl font-bold">Clarus Acts</p>
        </div>
      </div>

      <div className="bg-white w-full max-w-110 p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-[#1E293B] mb-2">
          Створити аккаунт
        </h1>
        <p className="text-[#64748B] text-center mb-8 text-[15px]">
          Почни створювати профессійні акти сьогодні
        </p>

        <form className="space-y-5 mb-4" onSubmit={handleSubmit(onSubmit)}>
          {state?.errors?._form && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
              {state.errors._form.join(', ')}
            </div>
          )}

          {/* Name Field*/}
          <div className="space-y-1.5">
            <Label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="name"
            >
              Ім&apos;я
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className={
                errors.name
                  ? 'border-red-400 focus-visible:ring-red-400/40'
                  : ''
              }
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-xs ml-1">{errors.name.message}</p>
            )}
            {!errors.name && state?.errors?.name && (
              <p className="text-red-500 text-xs ml-1">
                {state.errors.name.join(', ')}
              </p>
            )}
          </div>

          {/* Organization Name Field*/}
          <div className="space-y-1.5">
            <Label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="organizationName"
            >
              Назва організації
            </Label>
            <Input
              id="organizationName"
              type="text"
              placeholder="My Company LLC"
              className={
                errors.organizationName
                  ? 'border-red-400 focus-visible:ring-red-400/40'
                  : ''
              }
              {...register('organizationName')}
            />
            {errors.organizationName && (
              <p className="text-red-500 text-xs ml-1">
                {errors.organizationName.message}
              </p>
            )}
            {!errors.organizationName && state?.errors?.organizationName && (
              <p className="text-red-500 text-xs ml-1">
                {state.errors.organizationName.join(', ')}
              </p>
            )}
          </div>

          {/* Email Field*/}
          <div className="space-y-1.5">
            <Label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="email"
            >
              Пошта
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className={
                errors.email
                  ? 'border-red-400 focus-visible:ring-red-400/40'
                  : ''
              }
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-500 text-xs ml-1">
                {errors.email.message}
              </p>
            )}
            {!errors.email && state?.errors?.email && (
              <p className="text-red-500 text-xs ml-1">
                {state.errors.email.join(', ')}
              </p>
            )}
          </div>

          {/* Password Field*/}
          <div className="space-y-1.5">
            <Label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="password"
            >
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              className={
                errors.password
                  ? 'border-red-400 focus-visible:ring-red-400/40'
                  : ''
              }
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-500 text-xs ml-1">
                {errors.password.message}
              </p>
            )}
            {!errors.password && state?.errors?.password && (
              <p className="text-red-500 text-xs ml-1">
                {state.errors.password.join(', ')}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-linear-to-r w-full mx-auto from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] rounded-xl p-4 text-white shadow-md transition-color duration-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Submit"
          >
            {isPending && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            )}
            {isPending ? 'Реєстрація...' : 'Зареєструватись'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-[15px] text-[#64748B]">
          Вже маєте аккаунт?
          <Link
            href="/login"
            className="text-[#3170D4] font-semibold hover:underline ml-2"
          >
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
