import { fetchFence } from '@gen3/core/server';
import { parse } from 'cookie';

interface Gen3JTWKeys {
  keys: string[];
}

/**
 * Fetches a JSON Web Token (JWT) key from the specified endpoint.
 *
 * This asynchronous function interacts with the Gen3 Fence API to retrieve JWT keys.
 * If the response status is not 200 or the expected key format is not found, the function
 * will return null. Otherwise, it returns the first available key.
 *
 * @function
 * @async
 * @returns {Promise<string|null>} A Promise resolving to the JWT key as a string if available, or null if not.
 */
export const fetchJWTKey = async (useService: boolean = false) => {
  const response = await fetchFence<Gen3JTWKeys>(
    {
      endpoint: '/jwt/keys',
      isJSON: true,
    },
    useService,
  );
  if (response.status !== 200) {
    return null;
  }

  if (response?.data?.keys.length && response?.data?.keys[0].length > 1) {
    return response.data.keys[0][1];
  }
  return null;
};

/**
 * Extracts and validates the access token from the provided cookie string.
 *
 * This function parses the cookie string to retrieve an access token, while ensuring
 * its format and size meet expected criteria. It also supports "credentials login" in
 * development mode to retrieve a `credentials_token` as a fallback.
 *
 * @param {string} [cookie] - The cookie string containing token information. Optional.
 * @returns {string|null} The valid access token if present and correctly formatted, or `null` if unavailable, invalid, or inappropriate.
 *
 * @property {number} MAX_COOKIE_LENGTH - The maximum allowed length for the cookie string to prevent potential denial-of-service (DoS) attacks.
 * @property {RegExp} JWT_FORMAT_RE - The regex pattern used to validate the format of the JWT access token.
 *
 * @throws {void} - Does not explicitly throw exceptions but logs warnings when provided cookies exceed the size limit or contain invalid tokens.
 *
 * @example
 * A valid access token will be retrieved if it exists as 'access_token' in the cookie or 'credentials_token' in dev mode.
 * If the cookie string exceeds MAX_COOKIE_LENGTH or the token is misformatted, the returned value will be null.
 */
export const getAccessToken = (cookie?: string): string | null => {
  if (!cookie || typeof cookie !== 'string') {
    return null;
  }

  // Limit cookie header length to prevent DoS
  if (cookie.length > 8192) {
    console.warn('[auth] Cookie header exceeds maximum length');
    return null;
  }

  const cookies = cookie ? parse(cookie) : {};

  let accessToken = cookies.access_token ?? null;
  // in development mode we support "credentials login"
  if (!accessToken && process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    accessToken = cookies.credentials_token ?? null;
  }

  // Validate token format before returning
  if (accessToken) {
    const JWT_FORMAT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
    if (!JWT_FORMAT_RE.test(accessToken)) {
      console.warn('[auth] Invalid token format in cookie');
      return null;
    }
  }

  return accessToken;
};
