import { drsHostnamesSelector } from '../drsHostnameSlice';
import { getRegisteredState } from '../../../storeRef';

export const resolveCachedDRS = async (
  guidsForHostnameResolution: string[],
): Promise<Record<string, string>> => {
  const state = getRegisteredState();
  const resolvedIds: Record<string, string> = {};
  for (const guid of guidsForHostnameResolution) {
    const hostname = drsHostnamesSelector(guid, state);
    if (hostname) {
      resolvedIds[guid] = hostname;
    }
  }
  return resolvedIds;
};
