'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type BaseSyntheticEvent,
} from 'react';
import { useForm, type FieldErrors, type FieldPath } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { createActAction } from '@/modules/acts/actions';
import { CreateActRequestSchema } from '@/modules/acts/domain';
import { ActStorage } from '@/modules/acts/storage';
import { type ActFormValues, STEPS } from '@/modules/acts/types';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import {
  buildDefaultValues,
  toPayload,
  type ActItemInput,
} from '@/modules/acts/utils/form-defaults';
import {
  applyServerErrors,
  collectErrorPaths,
  findStepWithError,
} from '@/modules/acts/utils/form-errors';

const ACTS_URL = '/acts';
const LAST_STEP = STEPS.length - 1;

/** Watch events after which `act.parties.client.name` must be re-synced. */
const CLIENT_NAME_SOURCES = new Set<string | undefined>([
  undefined, // reset()
  'client',
  'client.snapshot',
  'client.snapshot.name',
]);

export const MESSAGES = {
  invalid: 'Перевірте правильність заповнення полів.',
  serverInvalid: 'Сервер знайшов помилки у формі. Перевірте виділені поля.',
  unexpected: 'Не вдалося зберегти акт. Спробуйте ще раз.',
  offlineSaveFailed: 'Не вдалося зберегти чернетку локально.',
} as const;

export type FormNotice = { kind: 'error' | 'info'; message: string };

export interface UseCreateActFormParams {
  contractor: { name: string; representative: string };
  projectId?: string | null;
  /** Read once on mount; later changes are intentionally ignored. */
  initialItems?: ActItemInput[];
}

function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  return error instanceof TypeError;
}

export function useCreateActForm({
  contractor,
  projectId,
  initialItems,
}: UseCreateActFormParams) {
  const router = useRouter();
  const isOnline = useNetworkStatus();
  const [isNavigating, startNavigation] = useTransition();

  const [currentStep, setCurrentStep] = useState(0);
  const [notice, setNotice] = useState<FormNotice | null>(null);

  const submittingRef = useRef(false);
  const leavingRef = useRef(false);

  // Computed once per mount: not at module load, not on every render.
  const [defaultValues] = useState(() =>
    buildDefaultValues({ contractor, projectId, initialItems }),
  );

  const form = useForm<ActFormValues>({
    resolver: zodResolver(CreateActRequestSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const {
    trigger,
    setValue,
    setError,
    watch,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = form;

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (!CLIENT_NAME_SOURCES.has(name)) return;
      setValue('act.parties.client.name', values.client?.snapshot?.name ?? '', {
        shouldDirty: false,
        shouldValidate: false,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Covers reload / tab close only. In-app navigation is not intercepted.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (leavingRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const goToStepWithError = useCallback((paths: readonly string[]) => {
    const index = findStepWithError(paths, STEPS);
    if (index >= 0) setCurrentStep(index);
  }, []);

  /** Navigates after a successful save; `isNavigating` keeps the UI locked. */
  const leaveAfterSave = useCallback(() => {
    leavingRef.current = true;
    startNavigation(() => {
      router.push(ACTS_URL);
    });
  }, [router]);

  const cancel = useCallback(() => router.push(ACTS_URL), [router]);

  const nextStep = useCallback(async () => {
    setNotice(null);
    const fields = STEPS[currentStep]
      .fields as readonly string[] as FieldPath<ActFormValues>[];
    if (await trigger(fields)) {
      // Absolute value, not `prev + 1`: a double click must not skip a step.
      setCurrentStep(Math.min(currentStep + 1, LAST_STEP));
    }
  }, [currentStep, trigger]);

  const prevStep = useCallback(() => {
    setNotice(null);
    setCurrentStep(Math.max(currentStep - 1, 0));
  }, [currentStep]);

  const saveOffline = useCallback(
    (payload: ActFormValues): boolean => {
      try {
        ActStorage.save(payload);
      } catch (error) {
        setNotice({
          kind: 'error',
          message:
            error instanceof Error ? error.message : MESSAGES.offlineSaveFailed,
        });
        return false;
      }
      leaveAfterSave();
      return true;
    },
    [leaveAfterSave],
  );

  const submit = useCallback(
    async (values: ActFormValues) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setNotice(null);

      try {
        const payload = toPayload(values);

        if (!isOnline) {
          saveOffline(payload);
          return;
        }

        let result: Awaited<ReturnType<typeof createActAction>>;
        try {
          result = await createActAction(null, payload);
        } catch (error) {
          console.error('createActAction failed', error);
          if (isNetworkError(error)) {
            saveOffline(payload);
          } else {
            setNotice({ kind: 'error', message: MESSAGES.unexpected });
          }
          return;
        }

        if (result?.errors) {
          const applied = applyServerErrors(setError, result.errors);
          goToStepWithError(applied);
          setNotice({
            kind: 'error',
            message: applied.length
              ? MESSAGES.serverInvalid
              : MESSAGES.unexpected,
          });
          return;
        }

        if (!result?.message) {
          setNotice({ kind: 'error', message: MESSAGES.unexpected });
          return;
        }

        leaveAfterSave();
      } finally {
        if (!leavingRef.current) submittingRef.current = false;
      }
    },
    [isOnline, saveOffline, setError, goToStepWithError, leaveAfterSave],
  );

  const onInvalid = useCallback(
    (errors: FieldErrors<ActFormValues>) => {
      goToStepWithError(collectErrorPaths(errors));
      setNotice({ kind: 'error', message: MESSAGES.invalid });
    },
    [goToStepWithError],
  );

  const onFormSubmit = useCallback(
    (event: BaseSyntheticEvent) => {
      event.preventDefault();
      if (currentStep < LAST_STEP) return nextStep();
      return handleSubmit(submit, onInvalid)(event);
    },
    [currentStep, nextStep, handleSubmit, submit, onInvalid],
  );

  return {
    form,
    currentStep,
    isLastStep: currentStep === LAST_STEP,
    isOnline,
    isBusy: isSubmitting || isNavigating,
    notice,
    prevStep,
    cancel,
    onFormSubmit,
  };
}
