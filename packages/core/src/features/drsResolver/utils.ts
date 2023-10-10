/**
 *  Resolves DRS object ID from a list of guids using dataguids.org
 *  Use of this function should be limited
 * @param guidsForHostnameResolution
 */
const resolveDRSWithDataGUISOrg = (
  guidsForHostnameResolution: string[],
): Promise<string[]> => {
  if (!Array.isArray(guidsForHostnameResolution) || !guidsForHostnameResolution.every((guid) => typeof guid === 'string')) {
    throw new Error('Invalid input: guidsForHostnameResolution must be an array of strings');
  }
  return Promise.all(
    guidsForHostnameResolution.map((guid) =>
      fetch(`https://dataguids.org/index/${guid}`)
        .then((r) => {
          if (r.ok) {
            return r.json();
          } else {
            throw Error('Failed to resolve DRS object ID');
          }
        })
        .catch((error) => {
          console.error('Failed to parse JSON response:', error);
          throw Error('Failed to resolve DRS object ID');
        }),
    ),
  );
};

enum DRSResolverType {
  dataGUISOrg = 'dataGUISOrg',
}

type DRSResolverCatalog = {
  [key in DRSResolverType]: (
    guidsForHostnameResolution: string[],
  ) => Promise<Awaited<string>[]>;
};

const DRS_Resolvers: DRSResolverCatalog = {
  dataGUISOrg: resolveDRSWithDataGUISOrg,
};

export const resolveDRSObjectId = (
  guidsForHostnameResolution: string[],
  resolver: DRSResolverType = DRSResolverType.dataGUISOrg,
) => {
  return DRS_Resolvers[resolver](guidsForHostnameResolution);
};
