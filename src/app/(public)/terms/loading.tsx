import { Skeleton } from '@/components/ui/skeleton';

export default function TermsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-20">
      <Skeleton className="h-8 w-64" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
