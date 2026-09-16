import { Skeleton } from '@/shared/ui/skeleton';

export default function CreateActLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />

      {/* Stepper */}
      <div className="flex items-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-10 rounded-full" />
        ))}
      </div>

      <Skeleton className="h-105 w-full rounded-xl" />
    </div>
  );
}
