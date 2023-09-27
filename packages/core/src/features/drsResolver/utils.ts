/**
 *  Resolves DRS object ID from a list of guids using dataguids.org
 *  Use of this function should be limited
 * @param guidsForHostnameResolution
 */
const resolveDRSWithDataGUIS_Org = (
  guidsForHostnameResolution: string[],
): Promise<string[]> => {
  return Promise.all(
    guidsForHostnameResolution.map((guid) =>
      fetch(`https://dataguids.org/index/${guid}`)
        .then((r) => r.json())
        .catch(() => {
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
  dataGUISOrg: resolveDRSWithDataGUIS_Org,
};

export const resolveDRSObjectId = (
  guidsForHostnameResolution: string[],
  resolver: DRSResolverType = DRSResolverType.dataGUISOrg,
) => {
  return DRS_Resolvers[resolver](guidsForHostnameResolution);
};
