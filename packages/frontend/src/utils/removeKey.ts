// from https://stackoverflow.com/questions/33053310/remove-value-from-object-without-mutation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { get, unset } from 'lodash';

export const removeKey = (
  key: string | number,
  { [key]: _, ...rest },
): Record<string | number, any> => rest;

export const removeKeys = <T extends Record<string, any> = Record<string, any>>(
  obj: T,
  keysToRemove: Array<string>,
) => {
  keysToRemove.forEach((key) => {
    if (key.includes('.')) {
      const [firstKey, ...nestedKeys] = key.split('.');
      const nestedObj = get(obj, firstKey);
      unset(nestedObj, nestedKeys.join('.'));
    } else {
      unset(obj, key);
    }
  });
  return obj;
};
