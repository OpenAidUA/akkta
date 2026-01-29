'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { supabase } from '@/shared/superbase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  }

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

        <form className="space-y-5 mb-4" onSubmit={submit}>
          {/* Name Field*/}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#1E293B] ml-0.5">
              Ім &apos; я
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Email Field*/}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#1E293B] ml-0.5">
              Пошта
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Password Field*/}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#1E293B] ml-0.5">
              Пароль
            </label>
            <input
              type="password"
              placeholder="Create a password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <Button
            className="bg-linear-to-r w-full mx-auto from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] rounded-xl p-4 text-white shadow-md transition-color duration-700 active:scale-95"
            aria-label="Submit"
          >
            Зареєструватись
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
