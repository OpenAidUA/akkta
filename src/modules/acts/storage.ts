import { CreateActRequest } from './domain';

const STORAGE_KEY = 'clarusacts_offline_acts';

export type LocalAct = CreateActRequest & {
  localId: string;
  createdAt: number;
};

export const ActStorage = {
  save: (act: CreateActRequest) => {
    const drafts = ActStorage.getAll();
    const newDraft: LocalAct = {
      ...act,
      localId: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    drafts.push(newDraft);
    // Use try-catch for quota exceeded errors
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error('Storage full', e);
      throw new Error('Не вистачає місця в браузері для збереження чернетки.');
    }
    return newDraft;
  },

  getAll: (): LocalAct[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  remove: (localId: string) => {
    const drafts = ActStorage.getAll().filter((d) => d.localId !== localId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCount: (): number => {
    return ActStorage.getAll().length;
  },
};
