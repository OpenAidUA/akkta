'use client';

import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { ActStorage, LocalAct } from '@/modules/acts/storage';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, WifiOff } from 'react-feather';
import { createActAction } from './create/action';
import { useRouter } from 'next/navigation';

export default function OfflineSyncBanner() {
  const isOnline = useNetworkStatus();
  const [offlineActs, setOfflineActs] = useState<LocalAct[]>(() =>
    ActStorage.getAll(),
  );
  const [isSyncing, startTransition] = useTransition();
  const router = useRouter();

  const handleSync = () => {
    if (!isOnline) return;

    startTransition(async () => {
      let successCount = 0;
      const errors = [];

      // Process sequentially to be safe
      for (const act of offlineActs) {
        try {
          // Remove local metadata before sending
          const { localId, createdAt, ...payload } = act;

          const result = await createActAction(null, payload);

          if (
            result?.errors ||
            (result?.message && result.message !== 'Success')
          ) {
            console.error(`Failed to sync act ${localId}:`, result);
            errors.push(localId);
          } else {
            ActStorage.remove(localId);
            successCount++;
          }
        } catch (e) {
          console.error(e);
          errors.push(act.localId);
        }
      }

      setOfflineActs(ActStorage.getAll());
      router.refresh();

      if (successCount > 0) {
        alert(`Успішно синхронізовано актів: ${successCount}`);
      }
      if (errors.length > 0) {
        alert(
          `Не вдалося синхронізувати актів: ${errors.length}. Спробуйте пізніше.`,
        );
      }
    });
  };

  if (offlineActs.length === 0) return null;

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-full text-amber-600">
          {isOnline ? <Cloud size={20} /> : <WifiOff size={20} />}
        </div>
        <div>
          <h3 className="font-semibold text-amber-900">
            {isOnline
              ? `Знайдено незбережені акти (${offlineActs.length})`
              : `Ви працюєте офлайн (${offlineActs.length} в черзі)`}
          </h3>
          <p className="text-sm text-amber-700">
            {isOnline
              ? 'У вас є чернетки, створені без інтернету. Синхронізуйте їх зараз.'
              : 'Акти збережено локально. Вони будуть готові до відправки при появі інтернету.'}
          </p>
        </div>
      </div>

      {isOnline && (
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
        >
          {isSyncing ? 'Синхронізація...' : 'Синхронізувати все'}
        </Button>
      )}
    </div>
  );
}
