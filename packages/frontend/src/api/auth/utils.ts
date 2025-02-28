import { fetchFence } from '@gen3/core';

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
export const fetchJWTKey = async () => {
  const response = await fetchFence<Gen3JTWKeys>({
    endpoint: '/jwt/keys',
    isJSON: true,
  });
  if (response.status !== 200) {
    return null;
  }

  if (response?.data?.keys.length && response?.data?.keys[0].length > 1) {
    return response.data.keys[0][1];
  }
  return null;
};
