import { isArray, isNotDefined, isObject, isString } from './ts-utils';
import { prepareUrl } from './url';
import {
  fetchFencePresignedURL,
  fetchJSONDataFromURL,
  HTTPError,
  HTTPErrorMessages,
  HttpMethod,
} from './fetch';
import { getCurrentTimestamp, isTimeGreaterThan } from './time';
import {
  calculatePercentageAsNumber,
  calculatePercentageAsString,
  convertToHistogramDataAsStringKey,
  stringifyJSONParam,
} from './conversions';

import { ExtractValueFromObject } from './extractvalues';

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
  convertToHistogramDataAsStringKey,
  calculatePercentageAsString,
  calculatePercentageAsNumber,
  stringifyJSONParam,
  ExtractValueFromObject,
};
export { getTimestamp } from './time';
