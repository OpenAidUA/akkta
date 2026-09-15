import React, { useActionState, startTransition, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { Button, Input, Label } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendRecoveryCodeAction } from '@/app/(auth)/recovery/action';
import {
  type RecoveryEmailSchema,
  recoveryEmailSchema,
} from '@/app/(auth)/recovery/schema';

type EmailStepFormProps = {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setStep: React.Dispatch<React.SetStateAction<'email' | 'code' | 'password'>>;
};

const EmailStepForm: React.FC<EmailStepFormProps> = ({ setEmail, setStep }) => {
  const [sendState, sendAction, isSending] = useActionState(
    sendRecoveryCodeAction,
    null,
  );

  const emailForm = useForm<RecoveryEmailSchema>({
    resolver: zodResolver(recoveryEmailSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (sendState?.success) {
      setStep('code');
    }
  }, [sendState, setStep]);

  const onSubmitEmail = (data: RecoveryEmailSchema) => {
    setEmail(data.email);
    // setBackToEmail(false);
    startTransition(() => {
      const formData = new FormData();
      formData.append('email', data.email);
      sendAction(formData);
    });
  };

  return (
    <>
      <form
        className="space-y-5 mb-4"
        onSubmit={emailForm.handleSubmit(onSubmitEmail)}
      >
        {sendState?.errors?._form && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
            {sendState.errors._form.join(', ')}
          </div>
        )}
        <div className="space-y-1.5">
          <Label
            className="text-sm font-semibold text-[#1E293B] ml-0.5"
            htmlFor="email"
          >
            Пошта
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={isSending}
            className={
              emailForm.formState.errors.email
                ? 'border-red-400 focus-visible:ring-red-400/40'
                : ''
            }
            {...emailForm.register('email')}
          />
          {emailForm.formState.errors.email && (
            <p className="text-red-500 text-xs ml-1">
              {emailForm.formState.errors.email.message}
            </p>
          )}
          {!emailForm.formState.errors.email && sendState?.errors?.email && (
            <p className="text-red-500 text-xs ml-1">
              {sendState.errors.email.join(', ')}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSending}
          className="bg-linear-to-r w-full mx-auto from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] rounded-xl p-4 text-white shadow-md transition-color duration-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          aria-label="Submit"
        >
          {isSending && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
          )}
          {isSending ? 'Обробка...' : 'Відправити код'}
        </Button>
      </form>

      <p className="text-center text-[15px] text-[#64748B] mt-6">
        Згадали пароль?
        <Link
          href="/login"
          className="text-[#3170D4] font-semibold hover:underline ml-2"
        >
          Увійти
        </Link>
      </p>
    </>
  );
};

export default EmailStepForm;
