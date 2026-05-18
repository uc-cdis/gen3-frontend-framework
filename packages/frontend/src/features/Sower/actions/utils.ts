import { isJobActionFunctionConfig } from '@gen3/core';

/**
 * Checks whether the given parameters contain a key named 'send'.
 *
 * @param {Record<string, any>} parameters - An object containing a set of key-value pairs to evaluate.
 * @returns {boolean} Returns `true` if the 'send' key exists in the provided parameters object, otherwise returns `false`.
 */
export const hasSendToAction = (parameters?: Record<string, unknown>) => {
  if (!parameters) return false;
  return (
    'sendAction' in parameters &&
    isJobActionFunctionConfig(parameters.sendAction)
  );
};
