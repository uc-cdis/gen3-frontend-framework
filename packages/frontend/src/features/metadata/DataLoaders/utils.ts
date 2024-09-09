import uniq from 'lodash/uniq';
import sum from 'lodash/sum';
import { JSONPath } from 'jsonpath-plus';
import { type AuthzMapping, JSONObject } from '@gen3/core';
import { SummaryStatisticsConfig } from '../Statistics';
import { SummaryStatistics } from '../Statistics/types';
import { DiscoveryIndexConfig, AccessLevel } from '../../Discovery/types';
import { userHasMethodForServiceOnResource } from '../../authorization/utils';

/**
 * Check for non-numeric items in an array and convert them to numbers.
 * Handles strings, numbers, and nested arrays.
 * It will silently convert any non-numeric items to 0 so as not to break the sum.
 * @param fields - array of fields to check
 */
const checkForNonNumericItems = (fields: (number | string | any)[]): number[] =>
  fields.map((item) => {
    if (typeof item === 'number') {
      return item;
    }
    // parse any string representation of an integer
    if (typeof item === 'string') {
      return parseInt(item, 10) || 0;
    }
    // if it's an array, recurse and sum the result
    if (Array.isArray(item)) {
      return sum(checkForNonNumericItems(item));
    }
    // if it's not a number, return 0 so as not to break the sum
    return 0;
  });

/**
 * Process a summary statistic using the provided data and summary config
 * @param {JSONObject }data
 * @param {SummaryStatisticsConfig} summary config from Discovery Config
 */
export const processSummary = (
  data: JSONObject[],
  summary: SummaryStatisticsConfig,
): string => {
  const { field, type } = summary;
  let fields = JSONPath({ path: `$..${field}`, json: data });
  // Replace any undefined fields with value 0
  fields = fields.map((item: string | number) =>
    typeof item === 'undefined' ? 0 : item,
  );
  switch (type) {
    case 'sum': {
      // parse any string representation of an integer
      fields = checkForNonNumericItems(fields);
      return sum(fields).toLocaleString();
    }
    case 'count':
      return uniq(fields).length.toLocaleString();
    default:
      throw new Error(
        `Misconfiguration error: Unrecognized aggregation type ${type}. Check the 'aggregations' block of the Discovery page config.`,
      );
  }
};

export const processAllSummaries = (
  data: JSONObject[],
  summaries: SummaryStatisticsConfig[],
) => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid input: data must be an array.');
  }
  if (!Array.isArray(summaries)) {
    throw new Error('Invalid input: summaries must be an array.');
  }

  return summaries.reduce((acc, summary) => {
    return [
      ...acc,
      {
        ...summary,
        value: processSummary(data, summary),
      },
    ];
  }, [] as SummaryStatistics);
};

export const processAuthorizations = (
  data: Array<JSONObject>,
  config: DiscoveryIndexConfig,
  authMapping: AuthzMapping,
): Array<JSONObject> => {
  const { authzField, dataAvailabilityField } = config.minimalFieldMapping;
  const { supportedValues } = config.features.authorization;

  return data.map((study) => {
    if (typeof study[authzField] !== 'string') return study;
    const studyAuthz = study[authzField] as string;
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
      const isAuthorized =
        userHasMethodForServiceOnResource(
          'read',
          '*',
          studyAuthz,
          authMapping,
        ) ||
        userHasMethodForServiceOnResource(
          'read',
          'peregrine',
          studyAuthz,
          authMapping,
        ) ||
        userHasMethodForServiceOnResource(
          'read',
          'guppy',
          studyAuthz,
          authMapping,
        ) ||
        userHasMethodForServiceOnResource(
          'read-storage',
          'fence',
          studyAuthz,
          authMapping,
        );
      if (supportedValues?.accessible?.enabled && isAuthorized) {
        accessible = AccessLevel.ACCESSIBLE;
      } else if (supportedValues?.unaccessible?.enabled && !isAuthorized) {
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
};
