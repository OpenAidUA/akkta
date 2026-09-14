import { Skeleton } from '@/components/ui/skeleton';

export default function ClientEditLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-100 w-full rounded-xl" />
    </div>
  );
}
