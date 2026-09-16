'use client';

import { useState } from 'react';

import EmailStepForm from '@/modules/auth/components/recovery/EmailStepForm';
import VerificationCodeForm from '@/modules/auth/components/recovery/VerificationCodeForm';
import NewPasswordForm from '@/modules/auth/components/recovery/NewPasswordForm';

const STEPS = {
  email: 'email',
  code: 'code',
  password: 'password',
};

const RecoveryFlow = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');

  return (
    <div className="bg-white w-full max-w-110 p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-[#1E293B] mb-2">
        {step === STEPS.email && 'Відновлення пароля'}
        {step === STEPS.code && 'Введіть код'}
        {step === STEPS.password && 'Новий пароль'}
      </h1>

      <p className="text-[#64748B] text-center mb-8 text-[15px]">
        {step === STEPS.email &&
          'Введіть свою пошту, щоб отримати код для відновлення пароля'}
        {step === STEPS.code && (
          <>
            Ми відправили 8-значний код на <br />
            <span className="font-semibold text-[#1E293B]">{email}</span>
          </>
        )}
        {step === STEPS.password &&
          'Придумайте надійний пароль для вашого акаунту'}
      </p>

      {step === STEPS.email && (
        <EmailStepForm setEmail={setEmail} setStep={setStep} />
      )}

      {step === STEPS.code && (
        <VerificationCodeForm email={email} setStep={setStep} />
      )}

      {step === STEPS.password && <NewPasswordForm />}
    </div>
  );
};

export default RecoveryFlow;
