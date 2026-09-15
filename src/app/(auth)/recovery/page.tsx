import Image from 'next/image';

import RecoveryFlow from '@/modules/auth/components/recovery/RecoveryFlow';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-3 px-6 py-5 items-center">
          <Image width={80} height={70} src="/mascot.png" alt="logo" />
          <p className="text-[65px] font-bold">Akkta</p>
        </div>
      </div>

      <RecoveryFlow />
    </div>
  );
}
