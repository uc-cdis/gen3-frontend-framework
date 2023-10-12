import { DiscoveryConfig, AccessLevel } from '../types';
import { userHasMethodForServiceOnResource } from '../../../utils';


// place holders for now
const useArboristUI = false;

const isEnabled = (feature: string) => {
  return false;
};

export const processDataAccess = (
  data: any[],
  discoveryConfig: DiscoveryConfig,
) => {
  if (discoveryConfig.features.authorization.enabled) {
    // mark studies as accessible or inaccessible to user
    const { authzField, dataAvailabilityField } =
      discoveryConfig.minimalFieldMapping;
    const { supportedValues } = discoveryConfig.features.authorization;
    // useArboristUI=true is required for userHasMethodForServiceOnResource
    if (!useArboristUI) {
      throw new Error(
        'Arborist UI must be enabled for the Discovery page to work if authorization is enabled in the Discovery page. Set `useArboristUI: true` in the portal config.',
      );
    }
    const studiesWithAccessibleField = data.map((study) => {
      let accessible: AccessLevel;
      if (
        supportedValues?.pending?.enabled &&
        dataAvailabilityField &&
        study[dataAvailabilityField] === 'pending'
      ) {
        accessible = AccessLevel.PENDING;
      } else if (supportedValues?.notAvailable?.enabled && !study[authzField]) {
        accessible = AccessLevel.NOT_AVAILABLE;
      } else {
        let authMapping;
        // TODO Continue to refactor this code
        // if (isEnabled('discoveryUseAggWTS')) {
        //   authMapping =
        //     props.userAggregateAuthMappings[
        //       study.commons_url || hostnameWithSubdomain
        //     ] || {};
        // } else {
        //   authMapping = props.userAuthMapping;
        // }
        const isAuthorized =
          userHasMethodForServiceOnResource(
            'read',
            '*',
            study[authzField],
            authMapping,
          ) ||
          userHasMethodForServiceOnResource(
            'read',
            'peregrine',
            study[authzField],
            authMapping,
          ) ||
          userHasMethodForServiceOnResource(
            'read',
            'guppy',
            study[authzField],
            authMapping,
          ) ||
          userHasMethodForServiceOnResource(
            'read-storage',
            'fence',
            study[authzField],
            authMapping,
          );
        if (supportedValues?.accessible?.enabled && isAuthorized === true) {
          accessible = AccessLevel.ACCESSIBLE;
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
    return studiesWithAccessibleField;
  } else {
    return data;
  }
};
