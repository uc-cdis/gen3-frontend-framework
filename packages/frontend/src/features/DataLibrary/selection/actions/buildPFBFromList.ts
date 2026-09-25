import type { ListActionFunction } from '../types';

export const exportToManifest: ListActionFunction = async (
  listId,
  params,
  onDone = () => null,
  onError = () => null,
) => {
  try {
    // construct sowerjob and submit it
  } catch (error: unknown) {
    if (error instanceof Error) {
      onError?.(error);
    } else onError?.(new Error('unknown error saving file'));
  }
};
