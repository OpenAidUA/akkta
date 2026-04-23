import React from 'react';
import { Lock } from 'react-feather';

export default function page() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <Lock size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Політика конфіденційності
          </h1>
          <p className="text-sm text-slate-500">
            Ця політика конфіденційності описує, як ми збираємо, використовуємо
            та захищаємо вашу інформацію при використанні нашого сервісу.
          </p>
        </div>
      </div>
    </div>
  );
}
