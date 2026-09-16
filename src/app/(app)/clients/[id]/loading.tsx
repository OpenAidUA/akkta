import { Skeleton } from '@/shared/ui/skeleton';

export default function ClientDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <Skeleton className="h-100 w-full rounded-xl" />
    </div>
  );
}
