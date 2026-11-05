import { isArray, isNotDefined, isObject, isString } from './ts-utils';
import { prepareUrl } from './url';
import {
  fetchFencePresignedURL,
  fetchJSONDataFromURL,
  HTTPError,
  HTTPErrorMessages,
  HttpMethod,
} from './fetch';
import {
  formatUptimeInMinutes,
  getCurrentTimestamp,
  isTimeGreaterThan,
} from './time';
import { ExtractValueFromObject } from './extractvalues';
import {
  type NormalizedError,
  type NormalizedErrorType,
  normalizeRtkError,
} from './normalizeRtkError';

export * from './conversions';

export * from './httpUserFriendlyErrorMessages';

export {
  isObject,
  isString,
  isNotDefined,
  isArray,
  prepareUrl,
  fetchFencePresignedURL,
  fetchJSONDataFromURL,
  HTTPError,
  HttpMethod,
  HTTPErrorMessages,
  getCurrentTimestamp,
  isTimeGreaterThan,
  formatUptimeInMinutes,
  ExtractValueFromObject,
  normalizeRtkError,
  type NormalizedErrorType,
  type NormalizedError,
};
export { getTimestamp } from './time';
