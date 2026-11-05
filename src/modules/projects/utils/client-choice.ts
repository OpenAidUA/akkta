import type { ProjectClientSnapshot } from '@/modules/projects/domain';

export interface CreateProjectFormClientOption {
  id: string;
  name: string;
  edrpou: string | null;
  phone: string | null;
  email: string | null;
}

/**
 * What the user picked in the "Замовник" step. A discriminated union instead
 * of three loosely related useState values (id / skip flag / "new" flag),
 * so impossible combinations cannot exist.
 */
export type ClientChoice =
  | { mode: 'new' }
  | { mode: 'existing'; clientId: string }
  | { mode: 'none' };

// Sentinels for the <Select>. They are UI-only and never sent to the server.
export const SELECT_NEW = '__new__';
export const SELECT_NONE = '__none__';

/** Fresh object every time: never share a mutable default between resets. */
export function createEmptyClientSnapshot(): ProjectClientSnapshot {
  return { name: '', edrpou: '', contactName: '', phone: '', email: '' };
}

export function clientToSnapshot(
  client: CreateProjectFormClientOption,
): ProjectClientSnapshot {
  return {
    name: client.name,
    edrpou: client.edrpou ?? '',
    contactName: '',
    phone: client.phone ?? '',
    email: client.email ?? '',
  };
}

export function choiceToSelectValue(choice: ClientChoice): string {
  if (choice.mode === 'existing') return choice.clientId;
  if (choice.mode === 'none') return SELECT_NONE;
  return SELECT_NEW;
}

/**
 * Maps a <Select> value to a choice. An id that is not in the list we
 * rendered is never trusted: it falls back to "new client", so an arbitrary
 * string can't end up as `client.id` in the request.
 */
export function selectValueToChoice(
  value: string,
  knownClients: ReadonlyMap<string, CreateProjectFormClientOption>,
): ClientChoice {
  if (value === SELECT_NONE) return { mode: 'none' };
  if (value !== SELECT_NEW && knownClients.has(value)) {
    return { mode: 'existing', clientId: value };
  }
  return { mode: 'new' };
}
