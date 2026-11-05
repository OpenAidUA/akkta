import type { DefaultValues } from 'react-hook-form';

import type { ActFormValues } from '@/modules/acts/types';

export const DEFAULT_CITY = 'Київ';
// 'Europe/Kiev' is the legacy alias: older ICU builds reject 'Europe/Kyiv'.
const BUSINESS_TIME_ZONES = ['Europe/Kyiv', 'Europe/Kiev'] as const;

export type ActItemInput = ActFormValues['act']['items'][number];

export const DEFAULT_ITEM: ActItemInput = {
  title: 'Послуги з розробки програмного забезпечення',
  unit: 'послуга',
  quantity: 1,
  unitPrice: 0,
};

export function todayISO(now: Date = new Date()): string {
  for (const timeZone of BUSINESS_TIME_ZONES) {
    try {
      return new Intl.DateTimeFormat('sv-SE', { timeZone }).format(now);
    } catch {
      // unsupported zone name in this runtime — try the next one
    }
  }
  return now.toLocaleDateString('sv-SE'); // local date, still YYYY-MM-DD
}

interface BuildDefaultValuesParams {
  contractor: { name: string; representative: string };
  projectId?: string | null;
  initialItems?: ActItemInput[];
}

export function buildDefaultValues({
  contractor,
  projectId = null,
  initialItems,
}: BuildDefaultValuesParams): DefaultValues<ActFormValues> {
  const items = initialItems?.length
    ? initialItems.map((item) => ({ ...item }))
    : [{ ...DEFAULT_ITEM }];

  return {
    act: {
      meta: { number: '', date: todayISO(), city: DEFAULT_CITY },
      items,
      parties: {
        contractor: {
          name: contractor.name,
          representative: contractor.representative,
        },
        client: { name: '' },
      },
    },
    client: {
      id: null,
      save: true,
      snapshot: { name: '', phone: '', email: '' },
    },
    projectId,
  };
}

export function toPayload(values: ActFormValues): ActFormValues {
  return {
    ...values,
    act: {
      ...values.act,
      parties: {
        ...values.act.parties,
        client: {
          ...values.act.parties.client,
          name: (values.client.snapshot.name ?? '').trim(),
        },
      },
    },
  };
}
