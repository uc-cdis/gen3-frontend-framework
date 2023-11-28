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
): Promise<Record<string,string>> => {
  if (
    !Array.isArray(guidsForHostnameResolution) ||
    !guidsForHostnameResolution.every(
      (guid: unknown) => typeof guid === 'string',
    )
  ) {
    throw new Error(
      'Invalid input: guidsForHostnameResolution must be an array of strings',
    );
  }
  try {
    const responses = await Promise.all(
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
            throw new ResolveDRSError('Failed to resolve DRS object ID');
          }
        } catch (error) {
          throw new ResolveDRSError('Failed to resolve DRS object ID');
        }
      }),
    );
    return responses.reduce((acc, response, index) => {
      if (response.data) {
        return {
          ...acc,
          [guidsForHostnameResolution[index]]: response.data,
        };
      } else {
        throw new ResolveDRSError('Failed to resolve DRS object ID');
      }
    }, {} as Record<string,string>);
  } catch (error) {
    throw new ResolveDRSError('Failed to resolve DRS object ID');
  }
};
