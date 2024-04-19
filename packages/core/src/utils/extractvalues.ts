import { JSONPath } from 'jsonpath-plus';
import { JSONObject } from '../types';

type JsonPathMapping = { [key: string]: string };

export const extractValuesFromObject = (mp: JsonPathMapping, obj: JSONObject): JSONObject =>{
  const result: { [key: string]: any } = {};

  for (const key in mp) {
    if (mp.hasOwnProperty(key)) {
      // Extract value using JSONPath. The result is an array of matches.
      const extractedValues = JSONPath({ path: mp[key], json: obj });

      // If the array is empty, no match was found, so set to undefined.
      result[key] = extractedValues.length > 0 ? extractedValues[0] : undefined;
    }
  }

  return result;
}
