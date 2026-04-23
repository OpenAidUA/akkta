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
            Умови використання
          </h1>
          <p className="text-sm text-slate-500">
            Ці умови використання описують правила та положення використання
            нашого сервісу. Будь ласка, уважно прочитайте ці умови перед
            використанням нашого сайту.
          </p>
        </div>
      </div>
    </div>
  );
}
