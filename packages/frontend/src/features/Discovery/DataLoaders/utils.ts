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
import { DiscoveryIndexConfig } from '../types';
import { AccessLevel } from '../../../utils';
import { userHasMethodForServiceOnResource } from '../../authorization/utils';
import { METADATA_ITEM_AUTHORIZATION_FIELD } from '../constants';

/**
 * Parses a single value into a number
 * @param item - Value to convert
 * @returns Numeric representation of the value
 */
const parseNumericValue = (item: unknown): number => {
  const DEFAULT_VALUE = 0;

  // Handle undefined values
  if (item === undefined) {
    return DEFAULT_VALUE;
  }

  // Numbers can be used directly
  if (typeof item === 'number' && !Number.isNaN(item)) {
    return item;
  }

  // Parse string representations of numbers
  if (typeof item === 'string') {
    const parsedValue = parseInt(item, 10);
    return Number.isNaN(parsedValue) ? DEFAULT_VALUE : parsedValue;
  }

  // Recursively handle arrays by summing their numeric values
  if (Array.isArray(item)) {
    return convertToNumbers(item).reduce((acc, val) => acc + val, 0);
  }

  // Return default for any other types
  return DEFAULT_VALUE;
};

/**
 * Converts various types of values to numbers
 * @param fields - Array of values to convert
 * @returns Array of numbers, with non-numeric values converted to 0
 */
const convertToNumbers = <T>(fields: T[]): number[] => {
  return fields.map(parseNumericValue);
};

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
      fields = convertToNumbers(fields);
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
    } else {
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
      // TODO: This needs to be configurable GFF-294
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
      [METADATA_ITEM_AUTHORIZATION_FIELD]: accessible,
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
