'use client';

import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type BaseSyntheticEvent,
} from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { createProjectWithClientAction } from '@/modules/projects/actions';
import {
  ProjectClientSnapshotSchema,
  ProjectDetailsSchema,
  type ProjectClientSnapshot,
  type ProjectDetailsInput,
} from '@/modules/projects/domain';
import { buildCreateProjectInput } from '@/modules/projects/utils/build-create-input';
import {
  choiceToSelectValue,
  clientToSnapshot,
  createEmptyClientSnapshot,
  selectValueToChoice,
  type ClientChoice,
  type CreateProjectFormClientOption,
} from '@/modules/projects/utils/client-choice';
import { isNextControlFlowError } from '@/shared/utils/next-errors';

const PROJECTS_URL = '/projects';

export const STEP_PROJECT = 0;
export const STEP_CLIENT = 1;

export const WIZARD_STEPS = [
  { id: 'project', title: 'Проєкт' },
  { id: 'client', title: 'Замовник' },
] as const;

const PROJECT_DEFAULTS: ProjectDetailsInput = {
  name: '',
  address: '',
  description: '',
  plannedStartDate: '',
  plannedEndDate: '',
};

const UNEXPECTED_ERROR =
  'Не вдалося створити проєкт. Перевірте з’єднання та спробуйте ще раз.';

interface UseCreateProjectFormParams {
  clients: readonly CreateProjectFormClientOption[];
}

export function useCreateProjectForm({ clients }: UseCreateProjectFormParams) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<number>(STEP_PROJECT);
  const [error, setError] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] =
    useState<ProjectDetailsInput | null>(null);
  const [choice, setChoice] = useState<ClientChoice>({ mode: 'new' });
  const [saveNewClient, setSaveNewClient] = useState(true);

  // Blocks a second submit in the same tick (before `isPending` re-renders).
  // Released only on failure: on success the redirect takes over and the form
  // must stay locked until the new page is shown.
  const submitLockRef = useRef(false);

  // Each step owns its form and its Zod schema; the hook ties them together.
  const projectForm = useForm<ProjectDetailsInput>({
    resolver: zodResolver(ProjectDetailsSchema),
    mode: 'onTouched',
    defaultValues: PROJECT_DEFAULTS,
  });
  const clientForm = useForm<ProjectClientSnapshot>({
    resolver: zodResolver(ProjectClientSnapshotSchema),
    mode: 'onTouched',
    defaultValues: createEmptyClientSnapshot(),
  });

  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );

  // ---- Step 1: project ---------------------------------------------------
  const submitProjectStep = projectForm.handleSubmit((data) => {
    setProjectDetails(data);
    setError(null);
    setStep(STEP_CLIENT);
  });

  // ---- Step 2: client ----------------------------------------------------
  const selectClient = (value: string) => {
    const next = selectValueToChoice(value, clientsById);
    setChoice(next);
    setError(null);

    if (next.mode === 'new') {
      clientForm.reset(createEmptyClientSnapshot());
      setSaveNewClient(true);
    } else if (next.mode === 'existing') {
      const client = clientsById.get(next.clientId);
      clientForm.reset(
        client ? clientToSnapshot(client) : createEmptyClientSnapshot(),
      );
    }
    // 'none': keep whatever was typed; it is ignored on submit.
  };

  const send = (snapshot: ProjectClientSnapshot) => {
    if (submitLockRef.current) return;

    if (!projectDetails) {
      setStep(STEP_PROJECT); // should not happen; recover instead of failing silently
      return;
    }

    submitLockRef.current = true;
    setError(null);

    const input = buildCreateProjectInput({
      project: projectDetails,
      choice,
      saveNewClient,
      snapshot,
    });

    // Contract: on success the action redirects. isPending stays true until
    // the navigation finishes, which keeps the form disabled meanwhile.
    startTransition(async () => {
      try {
        const result = await createProjectWithClientAction(input);
        if (result?.message) {
          setError(result.message);
          submitLockRef.current = false;
        }
      } catch (caught) {
        if (isNextControlFlowError(caught)) throw caught; // redirect() etc.
        console.error('createProjectWithClientAction failed', caught);
        setError(UNEXPECTED_ERROR);
        submitLockRef.current = false;
      }
    });
  };

  const submitClientStep = (event?: BaseSyntheticEvent) => {
    event?.preventDefault();

    // "Без замовника": hidden client fields must not block submission, so
    // their validation is skipped entirely.
    if (choice.mode === 'none') {
      send(createEmptyClientSnapshot());
      return;
    }
    return clientForm.handleSubmit(send)(event);
  };

  const goBack = () => {
    setError(null);
    setStep(STEP_PROJECT);
  };

  const cancel = () => router.push(PROJECTS_URL);

  return {
    steps: WIZARD_STEPS,
    step,
    error,
    isPending,
    goBack,
    cancel,
    details: {
      register: projectForm.register,
      control: projectForm.control,
      errors: projectForm.formState.errors,
      onSubmit: submitProjectStep,
    },
    client: {
      register: clientForm.register,
      errors: clientForm.formState.errors,
      mode: choice.mode,
      selectValue: choiceToSelectValue(choice),
      onSelect: selectClient,
      saveNew: saveNewClient,
      onSaveNewChange: setSaveNewClient,
      onSubmit: submitClientStep,
    },
  };
}
