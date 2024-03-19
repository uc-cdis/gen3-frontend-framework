import { JSONObject } from '@gen3/core';
import { toString } from 'lodash';

export const isPropertyKey = (value: unknown): value is PropertyKey => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol'
  );
};
export const hasOwnProperty = <X extends object, Y extends PropertyKey>(
  obj?: X,
  prop?: Y,
): obj is X & Record<Y, unknown> => {
  if (obj === undefined) return false;
  if (prop === undefined) return false;
  return Object.hasOwnProperty.call(obj, prop);
};
export const getParamsValueAsString = (params?: JSONObject, key?: string) => {
  return params && key && key !== '' && isPropertyKey(key) && hasOwnProperty(params, key)
    ? toString(params[key])
    : undefined;
};
