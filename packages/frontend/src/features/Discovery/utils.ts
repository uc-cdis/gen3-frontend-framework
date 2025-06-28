import { JSONPath } from 'jsonpath-plus';
import { JSONObject } from '@gen3/core';
import { DiscoveryIndexConfig } from './types';
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
