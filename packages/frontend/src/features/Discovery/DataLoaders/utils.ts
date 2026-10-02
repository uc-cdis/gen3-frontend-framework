import uniq from 'lodash/uniq';
import sum from 'lodash/sum';
import { JSONPath } from 'jsonpath-plus';
import {
  type AggregationsData,
  isObject,
  JSONArray,
  type JSONObject,
  type ResourceAuthzMapping,
} from '@gen3/core';
import type { SummaryStatisticsConfig } from '../Statistics';
import type { SummaryStatistics } from '../Statistics/types';
import type {
  AdvancedSearchFilters,
  DiscoveryIndexConfig,
  KeyValueSearchFilter,
} from '../types';
import { AccessLevel } from '../../../utils';
import { userHasMethodForServiceOnResource } from '../../authorization/utils';
import { METADATA_ITEM_AUTHORIZATION_FIELD } from '../constants';
import { getFilterValuesByKey } from '../Search/utils';
import type { TagData } from '../../Study/types';

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

/**
 * Processes a dataset to determine the access level of each study based on user authorization configurations.
 * This function relies on the availability of configuration settings and user authorization mapping to mark
 * studies as accessible or inaccessible for the current user.
 *
 * @param {Array<JSONObject>} data - An array of study objects to be processed, typically representing metadata.
 * Each study object in the dataset is examined to determine its accessibility.
 *
 * @param {DiscoveryIndexConfig} config - Configuration object for the Discovery page which includes:
 * - `features.authorization`: Contains the options related to authorization features.
 *   - `enabled`: (`boolean`) Whether authorization is enabled for the discovery page.
 *   - `supportedValues`: Object defining supported access levels and their states (e.g., accessible, unaccessible).
 *   - `isMesh`: (`boolean`) Whether the application uses a mesh structure for authorization mappings.
 * - `minimalFieldMapping`: Defines key mappings for specific required fields in the dataset.
 *   - `authzField`: (`string`) Field name in each study that holds the required authorization information.
 *   - `dataAvailabilityField`: (`string`) Field name in each study providing the data availability status.
 *
 * @param {ResourceAuthzMapping} userAuthMapping - Object mapping resources (e.g., subdomains or commons URLs) to
 * user-specific authorization details. Each resource maps to an object containing permissions for various services.
 *
 * @throws {Error} If authorization is enabled but no user authorization mapping (`userAuthMapping`) is provided,
 * an error is thrown with guidance for enabling the necessary Arborist settings in the portal configuration.
 *
 * @returns {Array<JSONObject>} A new array of study objects where each object includes an additional field
 * marking the study's accessibility status (`METADATA_ITEM_AUTHORIZATION_FIELD`), with possible access levels:
 * - `AccessLevel.ACCESSIBLE`: The study is deemed accessible to the user.
 * - `AccessLevel.UNACCESSIBLE`: The study is explicitly inaccessible.
 * - `AccessLevel.MIXED`: The study has mixed availability.
 * - `AccessLevel.NOT_AVAILABLE`: The study is unavailable to the user.
 * - `AccessLevel.WAITING`: Authorization for the study is in a waiting state.
 * - `AccessLevel.OTHER`: The study falls into an undefined or unsupported state.
 */
export const processAuthorizations = (
  data: Array<JSONObject>,
  config: DiscoveryIndexConfig,
  userAuthMapping: ResourceAuthzMapping,
  meshAuthMapping: ResourceAuthzMapping,
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

  console.log('Process authz');

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
        if (commonsURL?.startsWith('http')) {
          commonsURL = new URL(commonsURL).hostname;
        }
        authMapping =
          meshAuthMapping[commonsURL || hostnameWithSubdomain] || {};
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

export const processAdvancedSearchTerms = (
  advSearchFilters: AdvancedSearchFilters,
  data: JSONObject[],
  uidField: string,
): ReadonlyArray<KeyValueSearchFilter> => {
  return advSearchFilters.filters.map((filter) => {
    const { key, keyDisplayName } = filter;
    const values = getFilterValuesByKey(
      key,
      data,
      advSearchFilters.field,
      uidField,
    );
    return {
      key,
      keyDisplayName,
      valueDisplayNames: values.reduce(
        (acc, cur) => {
          acc[cur] = cur;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  });
};

// isTagsArray type guard
export const isTagDataArray = (value: any): value is TagData[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) => isObject(item) && 'name' in item && 'category' in item,
    )
  );
};

/**
 *  A hack to add data commons to tags if it exists
 * @param item
 */
export const addCommonsToTags = (item: JSONObject): JSONObject => {
  if (item.tags && isTagDataArray(item.tags) && 'commons' in item) {
    // return a copy: item may be frozen (e.g. RTK Query cache data)
    return {
      ...item,
      tags: [
        ...item.tags,
        {
          name: item.commons as string,
          category: 'Commons',
        },
      ] as unknown as JSONArray,
    };
  }
  return item;
};
