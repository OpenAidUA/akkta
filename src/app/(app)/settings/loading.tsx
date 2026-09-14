import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-4 w-72 ml-12" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
