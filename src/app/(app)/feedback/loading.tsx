import { Skeleton } from '@/components/ui/skeleton';

export default function FeedbackLoading() {
  return (
    <div className="mx-auto max-w-2xl pb-20">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-4 w-80 ml-12" />
      </div>

      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
