import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { isFetchBaseQueryError } from '../types/types';

export type NormalizedErrorType =
  | 'HTTP_ERROR' // server responded with non-2xx
  | 'FETCH_ERROR' // network failure, CORS, DNS, etc.
  | 'PARSING_ERROR' // response body couldn't be parsed
  | 'TIMEOUT_ERROR' // request timed out
  | 'CUSTOM_ERROR' // from queryFn / custom baseQuery
  | 'SERIALIZED_ERROR' // thrown JS error (e.g. in transformResponse)
  | 'UNKNOWN_ERROR';

export interface NormalizedError {
  type: NormalizedErrorType;
  /** HTTP status code, only present for HTTP_ERROR */
  status?: number;
  /** Human-readable message, best-effort extraction */
  message: string;
  /** Raw response body for HTTP errors, if any */
  data?: unknown;
}

/** Best-effort message extraction from an HTTP error body */
function extractMessage(data: unknown): string | undefined {
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data != null) {
    const obj = data as Record<string, unknown>;
    // common API error shapes: { message }, { error }, { detail } (FastAPI)
    for (const key of ['message', 'error', 'detail']) {
      const val = obj[key];
      if (typeof val === 'string') return val;
    }
  }
  return undefined;
}

export function normalizeRtkError(
  error: FetchBaseQueryError | SerializedError | undefined,
): NormalizedError {
  if (!error) {
    return { type: 'UNKNOWN_ERROR', message: 'Unknown error' };
  }

  if (isFetchBaseQueryError(error)) {
    // status is number for HTTP errors, string literal for the others
    if (typeof error.status === 'number') {
      return {
        type: 'HTTP_ERROR',
        status: error.status,
        message:
          extractMessage(error.data) ??
          `Request failed with status ${error.status}`,
        data: error.data,
      };
    }

    switch (error.status) {
      case 'FETCH_ERROR':
        return { type: 'FETCH_ERROR', message: error.error };
      case 'PARSING_ERROR':
        return {
          type: 'PARSING_ERROR',
          status: error.originalStatus, // PARSING_ERROR carries the HTTP status
          message: error.error,
          data: error.data,
        };
      case 'TIMEOUT_ERROR':
        return { type: 'TIMEOUT_ERROR', message: error.error };
      case 'CUSTOM_ERROR':
        return { type: 'CUSTOM_ERROR', message: error.error, data: error.data };
    }
  }

  // SerializedError — a JS error thrown somewhere in the pipeline
  if ('message' in error || 'name' in error) {
    return {
      type: 'SERIALIZED_ERROR',
      message: (error as SerializedError).message ?? 'An error occurred',
    };
  }

  return { type: 'UNKNOWN_ERROR', message: 'Unknown error' };
}
