import {
  AuthzResourceResponse,
  fetchArboristResources,
  GEN3_AUTHZ_API,
  JSONObject,
  JSONValue,
} from '@gen3/core';
import { DiscoveryIndexConfig } from '../types/discoveryApi';
import { AccessLevel } from '@gen3/frontend/utils';
import { getAccessToken } from '@/lib/auth/getLoginStatus';

const addAccessLevelsMetaData = async (
  data: Array<JSONObject>,
  cookies: any,
): Promise<Array<JSONObject>> => {
  let authzResources: AuthzResourceResponse | undefined;

  /*   try {
    const response = await fetch(`${GEN3_AUTHZ_API}/resources`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      authzResources = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch authz resources on server:', error);
    return [{ error: `Failed to fetch authz resources on server: ${error}` }];
  } */
  // console.log('cookies', cookies);
  const tokenFromCookie = getAccessToken(cookies) as string;
  // console.log('tokenFromCookie', tokenFromCookie);
  // Let the server-side helper resolve resources using the active Gen3 session.
  // From packages/sampleCommons/src/middleware-impl.ts
  authzResources = (await fetchArboristResources(
    tokenFromCookie,
    process.env.NODE_ENV === 'production',
  )) as unknown as AuthzResourceResponse;
  console.log('authzResources', authzResources);

  const determineStudyAccessLevel = (
    authz: undefined | null | JSONValue | string,
    data_availability: null | JSONValue | string,
    userAuthzResources: undefined | string[],
  ) => {
    const userHasAccessToResource = userAuthzResources?.includes(
      authz as string,
    );
    /*
    Not Available
    Gen3_discovery.data_availability: field exists and has the value not_available (regardless of authz contents)
    */
    if (data_availability && data_availability === 'not_available') {
      return AccessLevel.NOT_AVAILABLE;
    } else if (
      /*
    Request Access
    gen3_discovery.authz = has a value (/programs/open, for example)
    AND the user DOES NOT have access to that resource OR
    Gen3_discovery.data_availability: field exists and has the value unaccessible
    (for eg, https://healdata.org/mds/metadata/HDP00054) (regardless of authz contents)
    */
      (authz && !userHasAccessToResource) ||
      (data_availability && data_availability === 'unaccessible')
    ) {
      return AccessLevel.UNACCESSIBLE;
    } else if (authz && userHasAccessToResource && !data_availability) {
      /*
    Request Access
    gen3_discovery.authz = has a value (/programs/open, for example)
    AND the user has access to that resource
    AND gen3_discovery.data_availability: Field does not exist OR is empty
    OR does not have the values described above to trigger other statuses
    */
      return AccessLevel.ACCESSIBLE;
    } else if (
      /*
      Mixed Availability(New)
      Study meets the conditions for being identified as “available”
      AND
      Gen3_discovery.data_availability: field exists and has the value mixed_availability
      */
      authz &&
      userHasAccessToResource &&
      data_availability === 'mixed_availability'
    ) {
      console.log('Mixed access study found');
      return AccessLevel.MIXED;
    } else {
      /* Waiting (Default) */
      return AccessLevel.WAITING;
    }
  };

  return data.map((obj) => {
    let accessLevelNum = determineStudyAccessLevel(
      obj?.authz,
      obj?.data_availability,
      authzResources?.resources,
    );
    return {
      ...obj,
      __accessible: accessLevelNum,
    };
  });
};
export default addAccessLevelsMetaData;
