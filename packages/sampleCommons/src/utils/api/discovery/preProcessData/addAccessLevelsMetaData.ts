import {
  AuthzResourceResponse,
  fetchArboristResources,
  JSONObject,
  JSONValue,
} from '@gen3/core';
import { AccessLevel } from '@gen3/frontend/utils';
import { getAccessToken } from '@/lib/auth/getLoginStatus';

const addAccessLevelsMetaData = async (
  data: Array<JSONObject>,
  cookies: any,
): Promise<Array<JSONObject>> => {
  const tokenFromCookie = getAccessToken(cookies) as string;

  // Let the server-side helper resolve resources using the active Gen3 session.
  // From packages/sampleCommons/src/middleware-impl.ts
  // authzResources is a 1D array of strings, i.e. authzResources [ '/dictionary_page', '/programs/open', ... ]
  const authzResources = (await fetchArboristResources(
    tokenFromCookie,
    process.env.NODE_ENV === 'production',
  )) as string[];

  const determineStudyAccessLevel = (
    authz: undefined | null | JSONValue | string,
    data_availability: null | JSONValue | string,
    userAuthzResources: undefined | string[],
  ) => {
    const userHasAccessToResource = userAuthzResources?.includes(
      authz as string,
    );
    if (data_availability === 'unaccessible') return AccessLevel.UNACCESSIBLE;
    if (data_availability === 'not_available') return AccessLevel.NOT_AVAILABLE;
    if (!authz) return AccessLevel.WAITING;
    if (userHasAccessToResource) {
      return data_availability === 'mixed_availability'
        ? AccessLevel.MIXED
        : AccessLevel.ACCESSIBLE;
    }
    return AccessLevel.UNACCESSIBLE;
  };

  return data.map((obj) => {
    const accessLevelNum = determineStudyAccessLevel(
      obj?.authz,
      obj?.data_availability,
      authzResources,
    );
    return {
      ...obj,
      __accessible: accessLevelNum,
    };
  });
};
export default addAccessLevelsMetaData;
