import { Skeleton } from '@/shared/ui/skeleton';

export default function CreateClientLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-95 w-full rounded-xl" />
    </div>
  );
}
