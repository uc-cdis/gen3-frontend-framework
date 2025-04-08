import uniq from 'lodash/uniq';
import sum from 'lodash/sum';
import { JSONPath } from 'jsonpath-plus';
import {
  type ResourceAuthzMapping,
  type JSONObject,
  type AggregationsData,
} from '@gen3/core';
import { SummaryStatisticsConfig } from '../Statistics';
import { SummaryStatistics } from '../Statistics/types';
import { DiscoveryIndexConfig, AccessLevel } from '../types';
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
  userAuthMapping: ResourceAuthzMapping,
): Array<JSONObject> => {
  const { enabled } = config.features.authorization;

  if (!enabled) {
    return data;
  }

  if (!userAuthMapping) {
    throw new Error(
      'Arborist must be enabled for the Discovery page to work if authorization is enabled in the Discovery page. Set `useArboristUI: true` in the portal config.',
    );
  }

  const hostnameWithSubdomain = window.location.hostname; // TODO: replace this with useRouter

  // mark studies as accessible or inaccessible to user
  const { authzField, dataAvailabilityField } = config.minimalFieldMapping;
  const { supportedValues, isMesh } = config.features.authorization;

  const studiesWithAccessibleField = data.map((study) => {
    let accessible: AccessLevel = AccessLevel.NOT_AVAILABLE;
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
      let authMapping = {};
      if (isMesh) {
        let commonsURL = study.commons_url as string; // TODO: configure this value
        if (commonsURL && commonsURL.startsWith('http')) {
          commonsURL = new URL(commonsURL).hostname;
        }
        authMapping =
          userAuthMapping[commonsURL || hostnameWithSubdomain] || {};
      } else {
        authMapping = Object.values(userAuthMapping)[0];
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
      if (supportedValues?.accessible?.enabled && isAuthorized) {
        if (
          supportedValues?.mixed?.enabled &&
          dataAvailabilityField &&
          study[dataAvailabilityField] === 'mixed_availability'
        ) {
          accessible = AccessLevel.MIXED;
        } else {
          accessible = AccessLevel.ACCESSIBLE;
        }
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
  return studiesWithAccessibleField;
};

export const processChartData = (
  data: JSONObject[],
  pathsToProcess: string[],
) => {
  // Initialize results object
  const results: AggregationsData = {};

  pathsToProcess.forEach((path) => {
    // Use JSONPath to extract all values at the given path
    const values = JSONPath({
      path: `$[*].${path}`,
      json: data,
      flatten: true,
    });

    // Count occurrences of each value
    // add missing to count null values
    const counts: { [key: string]: number } = {};
    values.forEach((value: any) => {
      if (value && value !== '') {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    // Convert to required format and sort by count
    // Store results using the path as key
    results[path] = Object.entries(counts)
      .map(([key, count]) => ({
        key,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  });

  return results;
};
