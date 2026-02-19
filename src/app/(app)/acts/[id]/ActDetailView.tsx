'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader,
  CheckCircle,
  AlertCircle,
} from 'react-feather';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { ActWithClient } from '@/modules/acts/types';
import { generatePdfAction } from './actions';

interface ActDetailViewProps {
  act: ActWithClient;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft: {
    label: 'Чернетка',
    className: 'bg-gray-100 text-gray-800',
  },
  generating: {
    label: 'Генерація...',
    className: 'bg-yellow-100 text-yellow-800',
  },
  ready: {
    label: 'Готовий',
    className: 'bg-green-100 text-green-800',
  },
  failed: {
    label: 'Помилка',
    className: 'bg-red-100 text-red-800',
  },
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(n);
}

export default function ActDetailView({ act }: ActDetailViewProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const actData = act.data;
  const meta = actData.meta;
  const items = actData.items;
  const totals = actData.totals;
  const parties = actData.parties;
  const clientName =
    act.clientSnapshot?.name || act.client?.name || 'Без назви';

  const status = STATUS_MAP[act.status] ?? STATUS_MAP.draft;

  const dateStr = meta.date
    ? format(new Date(meta.date), 'd MMMM yyyy', { locale: uk })
    : '—';

  const handleGeneratePdf = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await generatePdfAction(act.id);
      if (result) {
        setMessage({
          text: result.message ?? '',
          error: result.error ?? false,
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/acts">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
              <ArrowLeft size={16} />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Акт № {meta.number || '—'}
            </h1>
            <p className="text-sm text-slate-500">{dateStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>

          {act.status === 'draft' || act.status === 'failed' ? (
            <Button
              onClick={handleGeneratePdf}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {isPending ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Генерація...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Згенерувати PDF
                </>
              )}
            </Button>
          ) : null}

          {act.status === 'ready' && (
            <a href={`/api/acts/${act.id}/pdf`} download>
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <Download size={16} />
                Завантажити PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            message.error
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message.error ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {message.text}
        </div>
      )}

      {/* Act Preview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 p-6 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Виконавець
            </p>
            <p className="font-semibold text-slate-900">
              {parties.contractor.name}
            </p>
            <p className="text-sm text-slate-500">
              {parties.contractor.representative}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Замовник
            </p>
            <p className="font-semibold text-slate-900">{clientName}</p>
            {act.clientSnapshot?.edrpou && (
              <p className="text-sm text-slate-500">
                ЄДРПОУ: {act.clientSnapshot.edrpou}
              </p>
            )}
            {parties.client.representative && (
              <p className="text-sm text-slate-500">
                {parties.client.representative}
              </p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex gap-6 p-6 border-b border-slate-100 text-sm">
          {meta.city && (
            <div>
              <span className="text-slate-400">Місто:</span>{' '}
              <span className="font-medium text-slate-700">{meta.city}</span>
            </div>
          )}
          <div>
            <span className="text-slate-400">Дата:</span>{' '}
            <span className="font-medium text-slate-700">{dateStr}</span>
          </div>
          {actData.contractRef && (
            <div>
              <span className="text-slate-400">Договір:</span>{' '}
              <span className="font-medium text-slate-700">
                {actData.contractRef}
              </span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Послуги / Роботи
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-xs font-semibold text-slate-400 w-10">
                  №
                </th>
                <th className="py-2 text-left text-xs font-semibold text-slate-400">
                  Назва
                </th>
                <th className="py-2 text-right text-xs font-semibold text-slate-400 w-20">
                  К-ть
                </th>
                <th className="py-2 text-right text-xs font-semibold text-slate-400 w-28">
                  Ціна
                </th>
                <th className="py-2 text-right text-xs font-semibold text-slate-400 w-28">
                  Сума
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const itemTotal = item.total ?? item.quantity * item.unitPrice;
                return (
                  <tr
                    key={i}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-3 text-slate-400">{i + 1}</td>
                    <td className="py-3 font-medium text-slate-900">
                      {item.title}
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {formatMoney(item.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-900">
                      {formatMoney(itemTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          {totals && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
              <div className="text-right">
                <div className="text-sm text-slate-500">Разом:</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatMoney(totals.total)}
                </div>
                {totals.totalText && (
                  <div className="text-xs text-slate-400 mt-1">
                    {totals.totalText}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
