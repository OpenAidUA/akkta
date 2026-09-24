import { Skeleton } from '@/shared/ui/skeleton';

export default function ProjectDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-xl mb-6" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
