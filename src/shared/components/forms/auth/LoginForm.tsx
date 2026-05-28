'use client';

import { useActionState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { Button, Input, Label } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchema } from '@/app/(auth)/login/schema';
import { loginAction } from '@/app/(auth)/login/action';

const LoginForm = () => {
  const [state, action, isPending] = useActionState(loginAction, null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = (data: LoginSchema) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      action(formData);
    });
  };

  return (
    <form className="space-y-5 mb-4" onSubmit={handleSubmit(onSubmit)}>
      {state?.errors?._form && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
          {state.errors._form.join(', ')}
        </div>
      )}

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
            errors.email ? 'border-red-400 focus-visible:ring-red-400/40' : ''
          }
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>
        )}
        {!errors.email && state?.errors?.email && (
          <p className="text-red-500 text-xs ml-1">
            {state.errors.email.join(', ')}
          </p>
        )}
      </div>

      {/* Password Field*/}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            className="text-sm font-semibold text-[#1E293B] ml-0.5"
            htmlFor="password"
          >
            Пароль
          </Label>
          <Link
            href="/recovery"
            className="text-[#3170D4] text-sm font-semibold hover:underline ml-2"
          >
            Забули пароль?
          </Link>
        </div>

        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className={
            errors.password
              ? 'border-red-400 focus-visible:ring-red-400/40'
              : ''
          }
          {...register('password')}
        />
        {errors.password && (
          <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>
        )}
        {!errors.password && state?.errors?.password && (
          <p className="text-red-500 text-xs ml-1">
            {state.errors.password.join(', ')}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid || isPending}
        className="bg-linear-to-r w-full mx-auto from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] rounded-xl p-4 text-white shadow-md transition-color duration-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Submit"
      >
        {isPending && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
        )}
        {isPending ? 'Вхід...' : 'Увійти'}
      </Button>
    </form>
  );
};

export default LoginForm;
