import crypto from 'crypto';

import { ActDocument, ActDocumentSchema } from './domain';
import { amountToWordsUAH } from './amount-to-words';

// Bankers rounding (round half to even)
function roundBankers(value: number, decimals = 2) {
  const factor = Math.pow(10, decimals);
  const n = value * factor;
  const floor = Math.floor(n);
  const diff = n - floor;
  // tie case
  if (Math.abs(diff - 0.5) < 1e-8) {
    const even = floor % 2 === 0 ? floor : floor + 1;
    return even / factor;
  }
  return Math.round(n) / factor;
}

// Calculate derived totals server-side and validate
export function calculateTotals(raw: ActDocument): ActDocument {
  const items = raw.items.map((it) => {
    const total = roundBankers(it.quantity * it.unitPrice, 2);
    return { ...it, total };
  });

  const subtotal = roundBankers(
    items.reduce((s, it) => s + (it.total ?? 0), 0),
    2,
  );
  const total = subtotal;
  const totals = { subtotal, total, totalText: amountToWordsUAH(total) };

  const out = { ...raw, items, totals };

  // Final server-side validation — throws on invalid data
  return ActDocumentSchema.parse(out);
}

export const checksumBuffer = (buf: Buffer): string => {
  return crypto.createHash('sha256').update(buf).digest('hex');
};
