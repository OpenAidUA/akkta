'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Loader, Send, X } from 'react-feather';
import { Button, Input, Label } from '@/shared/ui';
import {
  FeedbackSchema,
  type FeedbackRequest,
} from '@/modules/feedback/domain';
import { submitFeedbackAction } from './action';

const MAX_SCREENSHOTS = 3;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

type Screenshot = {
  file: File;
  previewUrl: string;
};

const initialState = null;

export default function FeedbackForm() {
  const [state, action, isPending] = useActionState(
    submitFeedbackAction,
    initialState,
  );
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const screenshotsRef = useRef<Screenshot[]>([]);
  const previousSuccess = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackRequest>({
    resolver: zodResolver(FeedbackSchema),
    mode: 'onTouched',
    defaultValues: { category: 'other', message: '' },
  });

  useEffect(() => {
    screenshotsRef.current = screenshots;
  }, [screenshots]);

  useEffect(() => {
    return () => {
      screenshotsRef.current.forEach(({ previewUrl }) =>
        URL.revokeObjectURL(previewUrl),
      );
    };
  }, []);

  useEffect(() => {
    if (state?.success && !previousSuccess.current) {
      previousSuccess.current = true;
      reset({ category: 'other', message: '' });
      setScreenshots((current) => {
        current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
        return [];
      });
    } else if (!state?.success) {
      previousSuccess.current = false;
    }
  }, [reset, state]);

  const removeScreenshot = (index: number) => {
    setScreenshots((current) => {
      URL.revokeObjectURL(current[index].previewUrl);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const addScreenshots = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    const availableSlots = MAX_SCREENSHOTS - screenshotsRef.current.length;
    if (selectedFiles.length > availableSlots) {
      setFileError(`Можна додати до ${MAX_SCREENSHOTS} скриншотів.`);
    } else if (
      selectedFiles.some(
        (file) =>
          !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
          file.size > MAX_FILE_SIZE,
      )
    ) {
      setFileError('Оберіть PNG, JPG або WEBP-файли розміром до 2 МБ.');
    } else {
      setFileError(null);
      setScreenshots((current) => [
        ...current,
        ...selectedFiles.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    }
  };

  const onSubmit = (data: FeedbackRequest) => {
    setFileError(null);
    startTransition(() => {
      const formData = new FormData();
      formData.set('category', data.category);
      formData.set('message', data.message);
      screenshots.forEach(({ file }) => formData.append('screenshots', file));
      action(formData);
    });
  };

  const generalError = state?.message && !state.success ? state.message : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {state?.success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle size={16} className="shrink-0" />
          {state.message}
        </div>
      )}
      {generalError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {generalError}
        </div>
      )}

      <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-slate-700">
            Тема звернення
          </Label>
          <select
            id="category"
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 transition-all hover:border-slate-300 focus-visible:border-transparent focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
            {...register('category')}
          >
            <option value="bug">Повідомити про проблему</option>
            <option value="idea">Запропонувати покращення</option>
            <option value="other">Інший відгук</option>
          </select>
          {errors.category && (
            <p className="text-xs text-red-500">{errors.category.message}</p>
          )}
          {!errors.category && state?.errors?.category && (
            <p className="text-xs text-red-500">{state.errors.category}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-slate-700">
            Ваш відгук <span className="text-red-400">*</span>
          </Label>
          <textarea
            id="message"
            rows={7}
            maxLength={5000}
            placeholder="Опишіть, що вам сподобалося, що не працює або що можна покращити…"
            className="flex w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-transparent focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
            {...register('message')}
          />
          {errors.message && (
            <p className="text-xs text-red-500">{errors.message.message}</p>
          )}
          {!errors.message && state?.errors?.message && (
            <p className="text-xs text-red-500">{state.errors.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="screenshots" className="text-slate-700">
            Скриншоти{' '}
            <span className="font-normal text-slate-400">
              (необов&apos;язково)
            </span>
          </Label>
          <Input
            id="screenshots"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            disabled={screenshots.length >= MAX_SCREENSHOTS || isPending}
            onChange={addScreenshots}
            className="cursor-pointer file:mr-3 file:cursor-pointer"
          />
          <p className="text-xs text-slate-400">
            До 3 файлів у форматі PNG, JPG або WEBP, до 2 МБ кожен.
          </p>
          {(fileError || state?.errors?.screenshots) && (
            <p className="text-xs text-red-500">
              {fileError ?? state?.errors?.screenshots}
            </p>
          )}

          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              {screenshots.map(({ file, previewUrl }, index) => (
                <div
                  key={previewUrl}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <Image
                    src={previewUrl}
                    alt="Попередній перегляд скриншота"
                    width={320}
                    height={180}
                    unoptimized
                    className="aspect-video h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    disabled={isPending}
                    aria-label={`Видалити ${file.name}`}
                    className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="w-auto px-6">
          {isPending ? (
            <>
              <Loader size={16} className="animate-spin" /> Надсилання…
            </>
          ) : (
            <>
              <Send size={16} /> Надіслати відгук
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
