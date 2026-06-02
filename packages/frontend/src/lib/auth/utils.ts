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

export const getAccessToken = (cookie?: string): string | undefined => {
  const cookies = cookie ? parse(cookie) : {};

  let accessToken = cookies.access_token;
  // in development mode we support "credentials login"
  if (!accessToken && process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    accessToken = cookies.credentials_token;
  }
  return accessToken;
};
