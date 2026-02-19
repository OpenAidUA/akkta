import type { Act, Client } from '@prisma/client';
import type { ActDocument, ClientSnapshot } from './domain';

/** Act row with JSON fields properly typed and the client relation included. */
export type ActWithClient = Omit<Act, 'data' | 'clientSnapshot'> & {
  data: ActDocument;
  clientSnapshot: ClientSnapshot;
  client: Client | null;
};
