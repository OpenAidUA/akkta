'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useActionState, startTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginAction } from './action';
import { loginSchema, type LoginSchema } from './schema';

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
          <Image width={40} height={40} src="/logo.png" alt="logo" />
          <p className="text-xl font-bold">Clarus Acts</p>
        </div>
      </div>

      <div className="bg-white w-full max-w-110 p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-[#1E293B] mb-2">
          З поверненням
        </h1>
        <p className="text-[#64748B] text-center mb-8 text-[15px]">
          Введіть свої дані, щоб увійти до аккаунту
        </p>

        <form className="space-y-5 mb-4" onSubmit={handleSubmit(onSubmit)}>
          {state?.errors?._form && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
              {state.errors._form.join(', ')}
            </div>
          )}

          {/* Email Field*/}
          <div className="space-y-1.5">
            <label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="email"
            >
              Пошта
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
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
            <label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="password"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
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
            {isPending ? 'Вхід...' : 'Увійти'}
          </Button>
        </form>

        {/* Separator OR */}
        {/* <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#94A3B8] font-medium tracking-wider">
              OR
            </span>
          </div>
        </div> */}

        {/* Google Sign Up */}
        {/* <button className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors mb-8">
          <span className="text-[#1E293B] font-medium">
            Sign up with Google
          </span>
        </button> */}

        {/* Footer */}
        <p className="text-center text-[15px] text-[#64748B]">
          Ще не спробували?
          <Link
            href="/register"
            className="text-[#3170D4] font-semibold hover:underline ml-2"
          >
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}
