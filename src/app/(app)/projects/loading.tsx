import { Skeleton } from '@/shared/ui/skeleton';

export default function ProjectsLoading() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <div className="mb-4">
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </>
  );
}
