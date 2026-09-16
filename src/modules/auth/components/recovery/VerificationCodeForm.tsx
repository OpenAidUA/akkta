import { useActionState, startTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Input, Label } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyRecoveryCodeAction } from '@/modules/auth/actions';
import {
  type RecoveryTokenFormSchema,
  recoveryTokenFormSchema,
} from '@/modules/auth/schema';

type VerificationCodeFormProps = {
  email: string;
  setStep: React.Dispatch<React.SetStateAction<'email' | 'code' | 'password'>>;
};

const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({
  email,
  setStep,
}) => {
  const [verifyState, verifyAction, isVerifying] = useActionState(
    verifyRecoveryCodeAction,
    null,
  );

  useEffect(() => {
    if (verifyState?.success) {
      setStep('password');
    }
  }, [verifyState, setStep]);

  const tokenForm = useForm<RecoveryTokenFormSchema>({
    resolver: zodResolver(recoveryTokenFormSchema),
    mode: 'onTouched',
    defaultValues: { token: '' },
  });

  const onSubmitToken = (data: RecoveryTokenFormSchema) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('token', data.token);
      verifyAction(formData);
    });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={tokenForm.handleSubmit(onSubmitToken)}
    >
      {verifyState?.errors?._form && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
          {verifyState.errors._form.join(', ')}
        </div>
      )}
      <div className="space-y-1.5">
        <Label
          className="text-sm font-semibold text-[#1E293B] ml-0.5"
          htmlFor="token"
        >
          Код з листа
        </Label>
        <Input
          id="token"
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="--------"
          className="text-center text-2xl tracking-[0.35em] font-mono"
          disabled={isVerifying}
          {...tokenForm.register('token', {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, '');
            },
          })}
        />
        {tokenForm.formState.errors.token && (
          <p className="text-red-500 text-xs ml-1">
            {tokenForm.formState.errors.token.message}
          </p>
        )}
        {!tokenForm.formState.errors.token && verifyState?.errors?.token && (
          <p className="text-red-500 text-xs ml-1">
            {verifyState.errors.token.join(', ')}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isVerifying}
        className="bg-linear-to-r w-full mx-auto from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] rounded-xl p-4 text-white shadow-md transition-color duration-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Submit"
      >
        {isVerifying && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
        )}
        {isVerifying ? 'Обробка...' : 'Відправити код'}
      </Button>

      <button
        type="button"
        onClick={() => setStep('email')}
        className="w-full text-sm text-[#64748B] hover:text-[#1E293B] mt-2 transition-colors"
      >
        Змінити email
      </button>
    </form>
  );
};

export default VerificationCodeForm;
