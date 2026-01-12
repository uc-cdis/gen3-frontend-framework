import { cloneDeep, get, unset } from 'lodash';

export const removeKeys = (obj: object, keysToRemove: Array<string>) => {
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
/**
 * Processes and assembles metadata by cloning objects, removing specified keys, and optionally accessing a defined metadata root.
 *
 * @param {Array<string>} keysToRemove - A list of keys to remove from each object in the selected resources after cloning.
 * @param {Array<Record<string, unknown>>} selectedResources - An array of resource objects to process and format.
 * @param {string} metadataRoot - The root key that holds the metadata in the objects. If present, this root is used as a starting point.
 * @returns {Array<Record<string, unknown>>} A new array of processed objects with the specified keys removed and metadata root applied when applicable.
 */
export const assembleMetadata = (
  selectedResources: Array<Record<string, unknown>>,
  metadataRoot: string,
  keysToRemove?: Array<string>,
) => {
  return selectedResources.map((obj) => {
    const clonedObj = cloneDeep(
      !obj[metadataRoot] ? obj : (obj[metadataRoot] as typeof obj),
    );
    // if there are keysToRemove, remove them
    if (keysToRemove) {
      return removeKeys(clonedObj, keysToRemove);
    }
    // Otherwise just return the cloned object
    return clonedObj;
  });
};
