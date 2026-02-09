'use client';

import { useActionState } from 'react';
import { createClientAction } from './action';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, FileText, Phone, Mail } from 'react-feather';
import Link from 'next/link';

const initialState = {
  message: '',
  errors: {},
};

export default function CreateClientPage() {
  const [state, formAction, isPending] = useActionState(
    createClientAction,
    initialState,
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <div className="mb-6">
        <Link
          href="/clients"
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад до списку
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Новий клієнт</h1>
      </div>

      <form
        action={formAction}
        className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        {state?.message && state.message !== 'Validation failed' && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {state.message}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-slate-400" /> Назва компанії або ПІБ
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-lg"
            placeholder="ТОВ Успіх"
          />
          {state?.errors?.name && (
            <p className="text-red-500 text-xs">{state.errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText size={16} className="text-slate-400" /> ЄДРПОУ / ІПН
          </label>
          <input
            name="edrpou"
            type="text"
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="12345678"
          />
          {state?.errors?.edrpou && (
            <p className="text-red-500 text-xs">{state.errors.edrpou}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-slate-400" /> Контактна особа
            </label>
            <input
              name="contactName"
              type="text"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Іван Іванов"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone size={16} className="text-slate-400" /> Телефон
            </label>
            <input
              name="phone"
              type="tel"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="+380 50 000 00 00"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Mail size={16} className="text-slate-400" /> Email
          </label>
          <input
            name="email"
            type="email"
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="client@mail.com"
          />
          {state?.errors?.email && (
            <p className="text-red-500 text-xs">{state.errors.email}</p>
          )}
        </div>

        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8"
          >
            {isPending ? (
              'Збереження...'
            ) : (
              <>
                <Save size={18} /> Зберегти клієнта
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
