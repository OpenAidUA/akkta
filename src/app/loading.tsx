import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 lg:px-8">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
