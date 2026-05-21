import {
  AuthzResourceResponse,
  GEN3_AUTHZ_API,
  JSONObject,
  JSONValue,
} from '@gen3/core';
import { DiscoveryIndexConfig } from '../types/discoveryApi';
import { AccessLevel } from '@gen3/frontend/utils';

const addAccessLevelsMetaData = async (
  data: Array<JSONObject>,
  discoveryConfig: DiscoveryIndexConfig,
): Promise<Array<JSONObject>> => {
  let authzResources: AuthzResourceResponse | undefined;

  try {
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
  }

  const determineStudyAccessLevel = (
    authz: undefined | null | JSONValue | string,
    data_availability: null | JSONValue | string,
    userAuthzResources: undefined | string[],
  ) => {
    console.log('authz', authz);
    console.log('dataAvailability', data_availability);
    console.log('userAuthzResources', userAuthzResources);

    // Gen3_discovery.data_availability: field exists and has the value not_available (regardless of authz contents)
    if (data_availability && data_availability === 'not_available') {
      return AccessLevel.NOT_AVAILABLE;
    } else if (
      /* gen3_discovery.authz = has a value (/programs/open, for example)
    AND the user DOES NOT have access to that resource OR
    Gen3_discovery.data_availability: field exists and has the value unaccessible
    (for eg, https://healdata.org/mds/metadata/HDP00054) (regardless of authz contents)
    */
      (authz && !userAuthzResources?.includes(authz as string)) ||
      (data_availability && data_availability === 'unaccessible')
    ) {
      return AccessLevel.UNACCESSIBLE;
    } else return AccessLevel.OTHER;
    //else return Math.floor(Math.random() * 6) + 1;
  };

  // Mocking this method for now to test UI. This will be updated in HP-2363.
  return data.map((obj) => {
    let accessLevelNum = determineStudyAccessLevel(
      obj?.authz,
      obj?.data_availability,
      authzResources?.resources,
    );
    // console.log('obj.authz', obj.authz);
    // console.log('obj.data_availability', obj.data_availability);
    // if (authzResources?.resources.includes(obj.authz))
    // if (obj.authz) accessLevelNum = 1;

    return {
      ...obj,
      __accessible: accessLevelNum,
    };
  });
};
export default addAccessLevelsMetaData;
