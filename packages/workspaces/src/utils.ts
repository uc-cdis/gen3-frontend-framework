import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Type guard to check if an object has FetchBaseQueryError shape
 */
function isFetchBaseQueryErrorShape(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

/**
 * Type guard to check if an object has a message property
 */
function hasMessageProperty(obj: unknown): obj is { message: unknown } {
  return typeof obj === 'object' && obj !== null && 'message' in obj;
}

/**
 * Type guard to check if an object has an error property
 */
function hasErrorProperty(obj: unknown): obj is { error: unknown } {
  return typeof obj === 'object' && obj !== null && 'error' in obj;
}

/**
 * Extracts a message from FetchBaseQueryError data field
 */
function extractMessageFromData(data: unknown): string | null {
  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    if (hasMessageProperty(data)) {
      return String(data.message);
    }
    if (hasErrorProperty(data)) {
      return String(data.error);
    }
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }

  return null;
}

/**
 * Extracts error message from a FetchBaseQueryError
 */
function extractFetchBaseQueryErrorMessage(
  error: FetchBaseQueryError,
): string | null {
  if ('error' in error && typeof error.error === 'string') {
    return error.error;
  }

  if ('data' in error) {
    return extractMessageFromData(error.data);
  }

  return null;
}

/**
 * Extracts a human-readable error message from RTK Query errors.
 * Handles both FetchBaseQueryError and SerializedError types.
 *
 * @param error - The error object from RTK Query
 * @returns A string representation of the error message
 */
export function getRTKQErrorMessage(error: unknown): string {
  if (!error) {
    return 'Unknown error';
  }

  if (isFetchBaseQueryErrorShape(error)) {
    const message = extractFetchBaseQueryErrorMessage(error);
    if (message) {
      return message;
    }
  }

  // Handle SerializedError
  if (hasMessageProperty(error)) {
    return String(error.message);
  }

  return String(error);
}
