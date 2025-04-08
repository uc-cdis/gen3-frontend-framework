import { JSONPath } from 'jsonpath-plus';
import { JSONObject } from '@gen3/core';
import {
  DiscoveryIndexConfig,
  type TagCategory,
  type TagData,
  type TagsConfig,
  AccessLevel,
} from './types';

export const jsonPathAccessor = (path: string) => (row: JSONObject) => {
  // TODO: add logging if path is not found
  return JSONPath({ json: row, path: path });
};

export interface TagInfo {
  color: string;
  display: boolean;
  label: string;
}

export const getTagInfo = (
  tagData: TagData,
  tagsConfig?: TagsConfig,
): TagInfo => {
  if (tagData.category === undefined) {
    return {
      color: 'darkgray',
      display: tagsConfig?.showUnknownTags ?? false,
      label: tagData.name,
    };
  }
  const categoryConfig = tagsConfig?.tagCategories.find(
    (category) => category.name === tagData.category,
  );
  if (categoryConfig === undefined)
    return {
      color: 'gray',
      display: tagsConfig?.showUnknownTags ?? false,
      label: tagData.name,
    };
  return {
    color: categoryConfig.color,
    display: categoryConfig?.display ? true : categoryConfig.display,
    label: categoryConfig?.displayName ?? tagData.name,
  };
};

// function given a Object and key as input will check if the key is present in the object
// if present return the value of the key else return undefined
export const getStringValueFromJSONObject = (
  objectData?: JSONObject,
  key?: string,
): string | undefined => {
  return key && objectData ? (objectData[key] as string) : undefined;
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
