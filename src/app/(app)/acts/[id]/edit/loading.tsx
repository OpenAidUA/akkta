import { Skeleton } from '@/shared/ui/skeleton';

export default function ActEditLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-125 w-full rounded-xl" />
    </div>
  );
}
