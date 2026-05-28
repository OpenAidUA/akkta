import Image from 'next/image';
import Link from 'next/link';

import LoginForm from '@/shared/components/forms/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-3 px-6 py-5 items-center">
          <Image width={80} height={70} src="/mascot.png" alt="logo" />
          <p className="text-[65px] font-bold">Akkta</p>
        </div>
      </div>

      <div className="bg-white w-full max-w-110 p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-[#1E293B] mb-2">
          З поверненням
        </h1>
        <p className="text-[#64748B] text-center mb-8 text-[15px]">
          Введіть свої дані, щоб увійти до аккаунту
        </p>

        <LoginForm />

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
