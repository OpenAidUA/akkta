import type { createProjectWithClientAction } from '@/modules/projects/actions';
import type {
  ProjectClientSnapshot,
  ProjectDetailsInput,
} from '@/modules/projects/domain';
import type { ClientChoice } from '@/modules/projects/utils/client-choice';

// Derived from the action itself, so the payload can't drift from its contract.
export type CreateProjectInput = Parameters<
  typeof createProjectWithClientAction
>[0];

interface BuildParams {
  project: ProjectDetailsInput;
  choice: ClientChoice;
  saveNewClient: boolean;
  /** Validated snapshot; ignored when the choice is "none". */
  snapshot: ProjectClientSnapshot;
}

export function buildCreateProjectInput({
  project,
  choice,
  saveNewClient,
  snapshot,
}: BuildParams): CreateProjectInput {
  switch (choice.mode) {
    case 'none':
      return { project, client: null };
    case 'existing':
      // Never re-save an existing client. The server must still resolve the
      // id against the caller's organization and not trust this snapshot.
      return {
        project,
        client: { id: choice.clientId, snapshot, save: false },
      };
    case 'new':
      return {
        project,
        client: { id: null, snapshot, save: saveNewClient },
      };
  }
}
