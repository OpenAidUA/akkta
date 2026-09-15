import { Skeleton } from '@/shared/ui/skeleton';

export default function RecoveryLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-17.5 w-55 rounded-md" />
      </div>

      <div className="bg-white w-full max-w-110 p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 space-y-6">
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md mx-auto" />
        </div>
      </div>
    </div>
  );
}
