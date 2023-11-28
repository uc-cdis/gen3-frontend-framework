import { resolveDRSWithDataGUISOrg } from "./resolvers/dataGUIDSDotOrg";
import { resolveCachedDRS } from "./resolvers/cachedDRSResolver";

enum DRSResolverType {
  dataGUISOrg = 'dataGUISOrg',
  cached = 'cached',
}

type DRSResolverCatalog = {
  [key in DRSResolverType]: (
    guidsForHostnameResolution: string[],
  ) => Promise<Awaited<Record<string, string>>>;
};

const DRS_Resolvers: DRSResolverCatalog = {
  dataGUISOrg: resolveDRSWithDataGUISOrg,
  cached: resolveCachedDRS,
};

export const resolveDRSObjectId = (
  guidsForHostnameResolution: string[],
  resolver: DRSResolverType = DRSResolverType.dataGUISOrg,
) => {
  return DRS_Resolvers[resolver](guidsForHostnameResolution);
};
