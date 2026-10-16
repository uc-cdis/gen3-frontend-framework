import { JSONPath } from 'jsonpath-plus';
import type { JSONObject } from '@gen3/core';
import type { DiscoveryIndexConfig } from './types';
import { AccessLevel } from '../../utils';

export const jsonPathAccessor = (path: string) => (row: JSONObject) => {
  // TODO: add logging if path is not found
  return JSONPath({ json: row, path: path });
};

export const getManualSortingAndPagination = (config: DiscoveryIndexConfig) => {
  const defaultFeature = 'client';
  const sortingAndPagination =
    config?.features?.dataLoader?.sortingAndPagination ?? defaultFeature;
  return sortingAndPagination === 'server';
};

/**
 * Converts a numeric value to its equivalent AccessLevel enum value
 * @param value - The numeric value to convert (1-6)
 * @returns The corresponding AccessLevel enum value or undefined if not found
 */
export const getAccessLevelFromNumber = (
  value?: number,
): AccessLevel | undefined => {
  if (value === undefined) return undefined;
  switch (value) {
    case AccessLevel.ACCESSIBLE:
      return AccessLevel.ACCESSIBLE;
    case AccessLevel.UNACCESSIBLE:
      return AccessLevel.UNACCESSIBLE;
    case AccessLevel.WAITING:
      return AccessLevel.WAITING;
    case AccessLevel.NOT_AVAILABLE:
      return AccessLevel.NOT_AVAILABLE;
    case AccessLevel.OTHER:
      return AccessLevel.OTHER;
    case AccessLevel.MIXED:
      return AccessLevel.MIXED;
    default:
      return undefined;
  }
};

export const StringToSupportedAccessLevels: Record<string, AccessLevel> = {
  accessible: AccessLevel.ACCESSIBLE,
  unaccessible: AccessLevel.UNACCESSIBLE,
  waiting: AccessLevel.WAITING,
  notAvailable: AccessLevel.NOT_AVAILABLE,
  other: AccessLevel.OTHER,
  mixed: AccessLevel.MIXED,
};

/**
 * Retrieves the list of supported access levels based on the provided configuration.
 *
 * @param {DiscoveryIndexConfig} config - The configuration object that contains feature-specific settings,
 *                                         including authorization and supported access levels.
 * @returns {Array<AccessLevel>} An array of access levels defined in the configuration.
 *
 * Type Member Properties:
 * - `config.features.authorization.supportedValues` (Object): A mapping of access level keys to their settings.
 *   Each key corresponds to a supported access level, and its value indicates whether the access level is enabled.
 * - `StringToSupportedAccessLevels` (Object): A predefined mapping that associates access level keys with their
 *   respective enumerated `AccessLevel` values.
 *
 * Notes:
 * - If `supportedValues` is undefined or empty in the configuration, the function returns an empty array.
 * - Only enabled access levels (where `value.enabled` is truthy) are included in the resulting array.
 */
export const processSupportedAccessLevels = (
  config: DiscoveryIndexConfig,
): Array<AccessLevel> => {
  const supportedValues = config?.features?.authorization?.supportedValues;
  if (!supportedValues) return [];
  return Object.keys(supportedValues).map(
    (x) => StringToSupportedAccessLevels[x],
  );
};
