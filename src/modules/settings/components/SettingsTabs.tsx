import { Tabs } from 'radix-ui';

import type { UpdateOrganizationRequest } from '@/modules/organizations/domain';
import SettingsForm from './SettingsForm';
import { BillingPlans } from './BillingForm';

interface SettingsTabsProps {
  defaultValues: UpdateOrganizationRequest;
}

export function SettingsTabs({ defaultValues }: SettingsTabsProps) {
  return (
    <Tabs.Root
      defaultValue="general"
      activationMode="automatic"
      className="w-full"
    >
      <Tabs.List
        aria-label="Налаштування організації"
        className="flex gap-6 border-b border-slate-200"
      >
        <Tabs.Trigger
          value="general"
          className={[
            '-mb-px border-b-2 px-5 py-4 text-sm font-medium',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-inset focus-visible:ring-blue-500',
            'data-[state=active]:border-blue-600',
            'data-[state=active]:text-blue-600',
            'data-[state=inactive]:border-transparent',
            'data-[state=inactive]:text-slate-500',
            'data-[state=inactive]:hover:text-slate-800',
          ].join(' ')}
        >
          Загальні
        </Tabs.Trigger>

        <Tabs.Trigger
          value="billing"
          className={[
            '-mb-px border-b-2 px-5 py-4 text-sm font-medium',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-inset focus-visible:ring-blue-500',
            'data-[state=active]:border-blue-600',
            'data-[state=active]:text-blue-600',
            'data-[state=inactive]:border-transparent',
            'data-[state=inactive]:text-slate-500',
            'data-[state=inactive]:hover:text-slate-800',
          ].join(' ')}
        >
          Білінг
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        value="general"
        forceMount
        className="pt-6 outline-none data-[state=inactive]:hidden"
      >
        <SettingsForm defaultValues={defaultValues} />
      </Tabs.Content>

      <Tabs.Content
        value="billing"
        forceMount
        className="pt-6 outline-none data-[state=inactive]:hidden"
      >
        <BillingPlans />
      </Tabs.Content>
    </Tabs.Root>
  );
}
