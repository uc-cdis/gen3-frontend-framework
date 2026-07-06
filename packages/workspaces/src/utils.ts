import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function getRTKQErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';

  // FetchBaseQueryError
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const err = error as FetchBaseQueryError;
    if ('error' in err && typeof err.error === 'string') {
      return err.error;
    }

    if ('data' in err) {
      if (typeof err.data === 'string') return err.data;

      if (typeof err.data === 'object' && err.data !== null) {
        // common API pattern: { message: "..." }
        if ('message' in err.data) {
          return String((err.data as any).message);
        }
        if ('error' in err.data) {
          return String((err.data as any).error);
        }

        return JSON.stringify(err.data);
      }
    }
  }

  // SerializedError
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message);
  }

  return String(error);
}
