'use client';
import Image from 'next/image';
import { Button, Input, Label } from '@/components/ui';
import { useActionState, startTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginAction } from '../login/action';
import { loginSchema, type LoginSchema } from '../login/schema';

export default function LoginPage() {
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-3 px-6 py-5 items-center">
          <Image width={80} height={70} src="/mascot.png" alt="logo" />
          <p className="text-[65px] font-bold">Acta</p>
        </div>
      </div>

      <div className="bg-white w-full max-w-110 p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-[#1E293B] mb-2">
          Відновлення пароля
        </h1>
        <p className="text-[#64748B] text-center mb-8 text-[15px]">
          Введіть свою пошту, щоб отримати інструкції для відновлення пароля
        </p>

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

          <Button
            type="submit"
            disabled={isPending}
            className="bg-linear-to-r w-full mx-auto from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] rounded-xl p-4 text-white shadow-md transition-color duration-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Submit"
          >
            {isPending && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            )}
            {isPending ? 'Відправка...' : 'Відправити'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-[15px] text-[#64748B]">
          Згадали пароль?
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
