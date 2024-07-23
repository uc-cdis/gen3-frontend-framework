import { JSONPath } from 'jsonpath-plus';
import { JSONObject } from '@gen3/core';
import {
  DiscoveryIndexConfig,
  type TagCategory,
  type TagData,
  type TagsConfig,
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
  tagsConfig: TagsConfig,
): TagInfo => {
  const categoryConfig = tagsConfig.tagCategories.find(
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
