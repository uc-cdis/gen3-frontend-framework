import type { NextApiResponse } from 'next';
import { errors as joseErrors } from 'jose';
import { isFetchError } from '@gen3/core';

const HTTP_INTERNAL_ERROR = 500;
/**
 * An object that contains predefined error messages for handling JWT-related issues.
 *
 * Properties:
 * - TOKEN_EXPIRED: Error message indicating that the JSON Web Token (JWT) has expired.
 * - TOKEN_INVALID: Error message specifying that the JWT is invalid.
 * - TOKEN_SIGNATURE_INVALID: Error message for when the JWT signature cannot be verified.
 * - JWKS_NO_MATCHING_KEY: Error message indicating that no matching key was found in JWKS
 *   (JSON Web Key Set) for JWT verification.
 * - UNKNOWN: General error message for unspecified or unknown errors.
 *
 */
const ERRORS = {
  TOKEN_EXPIRED: 'The JWT has expired.',
  TOKEN_INVALID: 'The JWT is invalid.',
  TOKEN_SIGNATURE_INVALID: 'The JWT signature is invalid.',
  JWKS_NO_MATCHING_KEY: 'No matching key found in JWKS for JWT verification.',
  UNKNOWN: 'Unknown error',
};

/**
 * Handles and returns an appropriate error response based on the provided error.
 *
 * @param {unknown} error - The error object which could be of various types such as fetch errors, JWT errors, or generic errors.
 * @param {NextApiResponse} res - The API response object used to send the error response.
 * @returns {NextApiResponse} - The response object containing the appropriate error status and message.
 *
 * This function evaluates the type of error passed to it and maps these errors to suitable
 * HTTP status codes and human-readable messages. It supports specific cases such as:
 * - Fetch errors.
 * - JSON Web Token (JWT) related errors (expired tokens, invalid tokens, signature issues, missing matching keys).
 * - Standard JavaScript errors.
 * - Unknown errors where it defaults to a generic unknown error message.
 *
 * The response will always include the error status and a message describing the error.
 */
export const getWebTokenErrorResponse = (
  error: unknown,
  res: NextApiResponse,
): NextApiResponse => {
  if (isFetchError(error)) {
    res.status(error.status).json({ message: error.statusText });
    return res;
  }

  if (error instanceof joseErrors.JWTExpired) {
    res.status(HTTP_INTERNAL_ERROR).json({ message: ERRORS.TOKEN_EXPIRED });
    return res;
  }
  if (error instanceof joseErrors.JWTInvalid) {
    res.status(HTTP_INTERNAL_ERROR).json({ message: ERRORS.TOKEN_INVALID });
    return res;
  }
  if (error instanceof joseErrors.JWSInvalid) {
    res
      .status(HTTP_INTERNAL_ERROR)
      .json({ message: ERRORS.TOKEN_SIGNATURE_INVALID });
    return res;
  }
  if (error instanceof joseErrors.JWKSNoMatchingKey) {
    res
      .status(HTTP_INTERNAL_ERROR)
      .json({ message: ERRORS.JWKS_NO_MATCHING_KEY });
    return res;
  }

  if (error instanceof Error) {
    res.status(HTTP_INTERNAL_ERROR).json({ message: error.message });
    return res;
  }

  res.status(HTTP_INTERNAL_ERROR).json({ message: ERRORS.UNKNOWN });
  return res;
};
