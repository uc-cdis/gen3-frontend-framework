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
  let authzResources = (await fetchArboristResources(
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

    let accessible: AccessLevel = AccessLevel.OTHER;
    /**
     *
     * Line by line porting from Data portal src/Discovery/index.tsx
     *
     */
    // ln 151 if
    // supportedValues?.unaccessible?.enabled && dataAvailabilityField && study[dataAvailabilityField] === 'unaccessible')
    if (data_availability && data_availability === 'unaccessible') {
      accessible = AccessLevel.UNACCESSIBLE;
    }
    // ln 155
    // else if (supportedValues?.notAvailable?.enabled && dataAvailabilityField && study[dataAvailabilityField] === 'not_available')
    else if (data_availability && data_availability === 'not_available') {
      accessible = AccessLevel.NOT_AVAILABLE;
    }
    // ln 159
    // else if (supportedValues?.waiting?.enabled && !study[authzField]))
    else if (!authz) {
      accessible = AccessLevel.WAITING;
    }
    // ln 161 else condition
    else {
      // ln 176
      if (userHasAccessToResource) {
        //ln 177
        // if (supportedValues?.mixed?.enabled && dataAvailabilityField && study[dataAvailabilityField] === 'mixed_availability')
        if (data_availability && data_availability === 'mixed_availability') {
          accessible = AccessLevel.MIXED;
        }
        // ln 181 else
        else {
          accessible = AccessLevel.ACCESSIBLE;
        }
      }
      // ln 184 else if
      // isAuthorized === false
      else if (!userHasAccessToResource) {
        accessible = AccessLevel.UNACCESSIBLE;
      }
    }

    return accessible;
    /**
     * RESULTS OF PREVIOUS APPROACH
     * Should be -  Waiting: 1018 * Implementation: 1018
     * Should be - Available: 109 * Implementation: 96
     * Should be - Request Access: 45 * Implementation:40
     * Should be - Not Available: 27 * Implementation:27
     */

    /*
    //Not Available
    //Gen3_discovery.data_availability: field exists and has the value not_available (regardless of authz contents)
    if (data_availability && data_availability === 'not_available') {
      return AccessLevel.NOT_AVAILABLE;
    } else if (
      // Request Access
      // gen3_discovery.authz = has a value (/programs/open, for example)
      // AND the user DOES NOT have access to that resource OR
      // Gen3_discovery.data_availability: field exists and has the value unaccessible
      // (for eg, https://healdata.org/mds/metadata/HDP00054) (regardless of authz contents)
      (authz && !userHasAccessToResource) ||
      (data_availability && data_availability === 'unaccessible')
    ) {
      return AccessLevel.UNACCESSIBLE;
    } else if (!authz) {
      // Waiting
      // gen3_discovery.authz: Field is empty
      // AND
      // gen3_discovery.data_availability:
      // Field does not exist OR is empty OR does not have the values described below to trigger other statuses
      return AccessLevel.WAITING;
    } else if (authz && userHasAccessToResource && !data_availability) {
      // Request Access
      // gen3_discovery.authz = has a value (/programs/open, for example)
      // AND the user has access to that resource
      // AND gen3_discovery.data_availability: Field does not exist OR is empty
      // OR does not have the values described above to trigger other statuses
      return AccessLevel.ACCESSIBLE;
    } else if (
      // Mixed Availability(New)
      // Study meets the conditions for being identified as “available”
      // AND
      // Gen3_discovery.data_availability: field exists and has the value mixed_availability
      authz &&
      userHasAccessToResource &&
      data_availability === 'mixed_availability'
    ) {
      return AccessLevel.MIXED;
    }
    // else {
    //   // Waiting (Default)
    //   return AccessLevel.WAITING;
    // }
    else return AccessLevel.OTHER;
    */
  };

  return data.map((obj) => {
    let accessLevelNum = determineStudyAccessLevel(
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
