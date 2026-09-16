import { useActionState, startTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label } from '@/shared/ui';
import { updateRecoveryPasswordAction } from '@/modules/auth/actions';
import {
  type RecoveryPasswordSchema,
  recoveryPasswordSchema,
} from '@/modules/auth/schema';
const NewPasswordForm = () => {
  const router = useRouter();

  const [updateState, updateAction, isUpdating] = useActionState(
    updateRecoveryPasswordAction,
    null,
  );

  useEffect(() => {
    if (updateState?.success) {
      router.push('/login');
    }
  }, [updateState, router]);

  const passwordForm = useForm<RecoveryPasswordSchema>({
    resolver: zodResolver(recoveryPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmitPassword = (data: RecoveryPasswordSchema) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('password', data.password);
      updateAction(formData);
    });
  };

  return (
    <form
      className="space-y-5 mb-4"
      onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
    >
      {updateState?.errors?._form && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
          {updateState.errors._form.join(', ')}
        </div>
      )}
      <div className="space-y-1.5">
        <Label
          className="text-sm font-semibold text-[#1E293B] ml-0.5"
          htmlFor="password"
        >
          Новий пароль
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Мінімум 10 символів"
          disabled={isUpdating}
          className={
            passwordForm.formState.errors.password
              ? 'border-red-400 focus-visible:ring-red-400/40'
              : ''
          }
          {...passwordForm.register('password')}
        />
        {passwordForm.formState.errors.password && (
          <p className="text-red-500 text-xs ml-1">
            {passwordForm.formState.errors.password.message}
          </p>
        )}
        {!passwordForm.formState.errors.password &&
          updateState?.errors?.password && (
            <p className="text-red-500 text-xs ml-1">
              {updateState.errors.password.join(', ')}
            </p>
          )}
      </div>

      <Button
        type="submit"
        disabled={isUpdating}
        className="bg-linear-to-r w-full mx-auto from-[#4481eb] to-[#2762d9] hover:from-[#3b74e0] hover:to-[#1e53c9] rounded-xl p-4 text-white shadow-md transition-color duration-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Submit"
      >
        Зберегти пароль
      </Button>
    </form>
  );
};

export default NewPasswordForm;
