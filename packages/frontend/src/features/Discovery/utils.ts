import  {JSONPath} from 'jsonpath-plus';
import { JSONObject } from '@gen3/core';
import { TagCategory } from './types';

export const jsonPathAccessor = (path: string) => (row: JSONObject) => {
  // TODO: add logging if path is not found
  return  JSONPath( { json: row, path: path });
};

export const getTagColor = (tagCategory: string, tagCategories: TagCategory[]): string => {
  const categoryConfig = tagCategories.find((category) => category.name === tagCategory);
  if (categoryConfig === undefined) {
    return 'gray';
  }
  return categoryConfig.color;
};
