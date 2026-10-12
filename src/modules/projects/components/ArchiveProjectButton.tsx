'use client';

import { useState, useTransition } from 'react';
import { Archive, RotateCcw } from 'react-feather';
import { Button } from '@/shared/ui/button';
import {
  archiveProjectAction,
  unarchiveProjectAction,
} from '@/modules/projects/actions';
import type { ProjectStatus } from '@prisma/client';

interface ArchiveProjectButtonProps {
  projectId: string;
  status: ProjectStatus;
}

export function ArchiveProjectButton({
  projectId,
  status,
}: ArchiveProjectButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isArchived = status === 'archived';

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = isArchived
        ? await unarchiveProjectAction(projectId)
        : await archiveProjectAction(projectId);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-red-500 text-xs">{error}</span>}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs gap-1.5"
        onClick={handleClick}
        disabled={isPending}
      >
        {isArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
        <span className="hidden md:inline">
          {isPending
            ? '...'
            : isArchived
              ? 'Відновити проєкт'
              : 'Архівувати проєкт'}
        </span>
      </Button>
    </div>
  );
}
