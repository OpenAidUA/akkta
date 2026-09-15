import { Skeleton } from '@/shared/ui/skeleton';

export default function ClientsLoading() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <div className="mb-4">
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </>
  );
}
