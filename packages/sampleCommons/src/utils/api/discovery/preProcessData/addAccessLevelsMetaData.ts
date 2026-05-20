import { AuthzResourceResponse, GEN3_AUTHZ_API, JSONObject } from '@gen3/core';
import { DiscoveryIndexConfig } from '../types/discoveryApi';

const addAccessLevelsMetaData = async (
  data: Array<JSONObject>,
  discoveryConfig: DiscoveryIndexConfig,
): Promise<Array<JSONObject>> => {
  let authzResources: AuthzResourceResponse | undefined;

  try {
    // 1. Request the data directly on the server
    const response = await fetch(`${GEN3_AUTHZ_API}/resources`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      authzResources = await response.json();
      // console.log(authzResources);
    }
  } catch (error) {
    console.error('Failed to fetch authz resources on server:', error);
    return [{ error: `Failed to fetch authz resources on server: ${error}` }];
  }

  // Mocking this method for now to test UI. This will be updated in HP-2363.
  return data.map((obj) => {
    let accessLevelNum = Math.floor(Math.random() * 6) + 1;
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
