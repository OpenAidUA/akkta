'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'react-feather';
import { Button } from '@/components/ui/button';
import { deleteClientAction } from '@/app/(app)/clients/actions';

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
}

export function DeleteClientButton({
  clientId,
  clientName,
}: DeleteClientButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteClientAction(clientId);
      if (result?.error) {
        setError(result.error);
        setShowConfirm(false);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        {error && (
          <span className="text-red-500 text-xs mr-2">{error}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-slate-500 hover:bg-slate-100"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
        >
          Ні
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? '...' : 'Так, видалити'}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
      onClick={() => setShowConfirm(true)}
      title={`Видалити ${clientName}`}
    >
      <Trash2 size={14} className="text-red-400" />
    </Button>
  );
}
