import { resolveDRSWithDataGUISOrg } from './resolvers/dataGUIDSDotOrg';
import { resolveCachedDRS } from './resolvers/cachedDRSResolver';

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

// TODO - add to config file for DRS resolver
export const resolveDRSObjectId = (
  guidsForHostnameResolution: string[],
  resolver: DRSResolverType = DRSResolverType.cached,
) => {
  return DRS_Resolvers[resolver](guidsForHostnameResolution);
};
