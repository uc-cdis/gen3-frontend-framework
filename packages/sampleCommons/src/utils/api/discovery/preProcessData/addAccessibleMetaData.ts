import { JSONObject } from '@gen3/core';
import { DiscoveryIndexConfig } from '../types/discoveryApi';

const addAccessibleMetaData = (
  data: Array<JSONObject>,
  discoveryConfig: DiscoveryIndexConfig,
) => {
  // Mock this method for now
  return data.map((obj) => {
    const randomAccessibleNum = Math.floor(Math.random() * 6) + 1;
    return {
      ...obj,
      __accessible: randomAccessibleNum,
    };
  });
};
export default addAccessibleMetaData;

// TODO
// Commented out code from /data-portal/src/Discovery/index.tsx
/*
// Metadata Placeholder
import { JSONObject } from '@gen3/core';

// Start of Placeholder Variables, should be updated with values from Config and update with working functions

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isEnabled = (str: string) => true;

const userHasMethodForServiceOnResource = (
  method: string,
  service: string,
  resourcePath: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userAuthMapping = {},
) => true;
const hostnameWithSubdomain = 'key';
const userAggregateAuthMappings = { key: 'value' };
const userAuthMapping = 'userAuthMapping';
const config = {
  minimalFieldMapping: {
    authzField: 'authz',
    dataAvailabilityField: 'data_availability',
  },
  features: {
    authorization: {
      enabled: true,
      supportedValues: {
        accessible: {
          enabled: true,
          menuText: 'Available',
        },
        unaccessible: {
          enabled: true,
          menuText: 'Request Access',
        },
        waiting: {
          enabled: true,
          menuText: 'Waiting',
        },
        notAvailable: {
          enabled: true,
          menuText: 'Not Available',
        },
        mixed: {
          enabled: true,
        },
      },
    },
  },
};
// End of Placeholder Variables, this should be updated with values from Config and update with working functions

enum AccessLevel {
  ACCESSIBLE = 1,
  UNACCESSIBLE = 2,
  WAITING = 3,
  NOT_AVAILABLE = 4,
  OTHER = 5,
  MIXED = 6,
}

const AddAuthMetaData = (data: Array<JSONObject>) => {
  let studiesToSet;
  if (config.features.authorization.enabled) {
    // mark studies as accessible or inaccessible to user
    const { authzField, dataAvailabilityField } = config.minimalFieldMapping;
    const { supportedValues } = config.features.authorization;

    // useArboristUI=true is required for userHasMethodForServiceOnResource
    // if (!useArboristUI) {
    //  throw new Error(
    //    'Arborist UI must be enabled for the Discovery page to work if authorization is enabled in the Discovery page. Set `useArboristUI: true` in the portal config.',
    //  );
    //}
    const studiesWithAccessibleField = data.map((study) => {
      // Added default declaration Nov 2025 for TS issue
      let accessible: AccessLevel = AccessLevel.UNACCESSIBLE;
      if (
        supportedValues?.unaccessible?.enabled &&
        dataAvailabilityField &&
        study[dataAvailabilityField] === 'unaccessible'
      ) {
        accessible = AccessLevel.UNACCESSIBLE;
      } else if (
        supportedValues?.notAvailable?.enabled &&
        dataAvailabilityField &&
        study[dataAvailabilityField] === 'not_available'
      ) {
        accessible = AccessLevel.NOT_AVAILABLE;
      } else if (supportedValues?.waiting?.enabled && !study[authzField]) {
        accessible = AccessLevel.WAITING;
      } else {
        let authMapping;
        if (isEnabled('discoveryUseAggWTS')) {
          let commonsURL = study.commons_url;
          if (commonsURL && (commonsURL as string).startsWith('http')) {
            commonsURL = new URL(commonsURL as string).hostname;
          }
          authMapping =
            userAggregateAuthMappings[
              (commonsURL ||
                hostnameWithSubdomain) as keyof typeof userAggregateAuthMappings
            ] || {};
        } else {
          authMapping = userAuthMapping;
        }
        const isAuthorized =
          userHasMethodForServiceOnResource(
            'read',
            '*',
            study[authzField] as string,
            authMapping,
          ) ||
          userHasMethodForServiceOnResource(
            'read',
            'peregrine',
            study[authzField] as string,
            authMapping,
          ) ||
          userHasMethodForServiceOnResource(
            'read',
            'guppy',
            study[authzField] as string,
            authMapping,
          ) ||
          userHasMethodForServiceOnResource(
            'read-storage',
            'fence',
            study[authzField] as string,
            authMapping,
          );
        if (supportedValues?.accessible?.enabled && isAuthorized === true) {
          if (
            supportedValues?.mixed?.enabled &&
            dataAvailabilityField &&
            study[dataAvailabilityField] === 'mixed_availability'
          ) {
            accessible = AccessLevel.MIXED;
          } else {
            accessible = AccessLevel.ACCESSIBLE;
          }
        } else if (
          supportedValues?.unaccessible?.enabled &&
          isAuthorized === false
        ) {
          accessible = AccessLevel.UNACCESSIBLE;
        } else {
          accessible = AccessLevel.OTHER;
        }
      }
      return {
        ...study,
        __accessible: accessible,
      };
    });
    studiesToSet = studiesWithAccessibleField;
  }
  return studiesToSet as Array<JSONObject>;
};

export default AddAuthMetaData;
*/
