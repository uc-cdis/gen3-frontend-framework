import { JSONPath } from 'jsonpath-plus';
import { JSONObject } from '@gen3/core';
import { TagCategory } from './types';

export const jsonPathAccessor = (path: string) => (row: JSONObject) => {
  // TODO: add logging if path is not found
  return JSONPath({ json: row, path: path });
};

export const getTagColor = (
  tagCategory: string,
  tagCategories: TagCategory[],
): string => {
  const categoryConfig = tagCategories.find(
    (category) => category.name === tagCategory,
  );
  if (categoryConfig === undefined) {
    return 'gray';
  }
  return categoryConfig.color;
};


// function given a Object and key as input will check if the key is present in the object
// if present return the value of the key else return undefined
export const getStringValueFromJSONObject = (objectData?: JSONObject, key?: string): string | undefined => {
  return key && objectData ? objectData[key] as string : undefined;
};
