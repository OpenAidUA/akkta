'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from './action';

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(registerAction, null);

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

        <form className="space-y-5 mb-4" action={action}>
          {state?.errors?._form && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
              {state.errors._form.join(', ')}
            </div>
          )}

          {/* Name Field*/}
          <div className="space-y-1.5">
            <label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="name"
            >
              Ім&apos;я
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {state?.errors?.name && (
              <p className="text-red-500 text-xs ml-1">
                {state.errors.name.join(', ')}
              </p>
            )}
          </div>

          {/* Organization Name Field*/}
          <div className="space-y-1.5">
            <label
              className="text-sm font-semibold text-[#1E293B] ml-0.5"
              htmlFor="organizationName"
            >
              Назва організації
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              placeholder="My Company LLC"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {state?.errors?.organizationName && (
              <p className="text-red-500 text-xs ml-1">
                {state.errors.organizationName.join(', ')}
              </p>
            )}
          </div>

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
              name="email"
              type="email"
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {state?.errors?.email && (
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
              name="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {state?.errors?.password && (
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
            {isPending ? 'Реєстрація...' : 'Зареєструватись'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Вже є аккаунт? Увійти
          </Link>
        </div>

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
          Вже маєте аккаунт?
          <a
            href="/login"
            className="text-[#3170D4] font-semibold hover:underline ml-2"
          >
            Увійти
          </a>
        </p>
      </div>
    </div>
  );
}
