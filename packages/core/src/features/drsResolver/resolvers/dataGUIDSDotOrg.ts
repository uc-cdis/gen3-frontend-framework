/**
 * Custom error class for resolving DRS object ID errors
 */
class ResolveDRSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResolveDRSError';
  }
}

/**
 *  Resolves DRS object ID from a list of guids using dataguids.org
 *  Use of this function should be limited
 * @param guidsForHostnameResolution
 */
export const resolveDRSWithDataGUISOrg = async (
  guidsForHostnameResolution: string[],
): Promise<Record<string, string>> => {
  const INVALID_INPUT_ERROR =
    'Invalid input: guidsForHostnameResolution must be an array of strings';
  const RESOLVE_DRS_ERROR = 'Failed to resolve DRS object ID';

  if (
    !Array.isArray(guidsForHostnameResolution) ||
    !guidsForHostnameResolution.every(
      (guid: unknown) => typeof guid === 'string',
    )
  ) {
    throw new Error(INVALID_INPUT_ERROR);
  }

  try {
    const responses = await Promise.allSettled(
      guidsForHostnameResolution.map(async (guid) => {
        try {
          const response = await fetch(`https://dataguids.org/index/${guid}`);
          if (response.status === 200) {
            try {
              return await response.json();
            } catch (error) {
              throw new ResolveDRSError('Failed to parse response as JSON');
            }
          } else {
            throw new ResolveDRSError(RESOLVE_DRS_ERROR);
          }
        } catch (error) {
          throw new ResolveDRSError(RESOLVE_DRS_ERROR);
        }
      }),
    );

    return responses.reduce((acc, response, index) => {
      if (response.status === 'fulfilled' && response.value.data) {
        return {
          ...acc,
          [guidsForHostnameResolution[index]]: response.value.data,
        };
      } else {
        throw new ResolveDRSError(RESOLVE_DRS_ERROR);
      }
    }, {} as Record<string, string>);
  } catch (error) {
    throw new ResolveDRSError(RESOLVE_DRS_ERROR);
  }
};
