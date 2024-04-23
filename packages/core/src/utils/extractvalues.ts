type JsonPathMapping = { [key: string]: string };

export interface JSONObject {
  [k: string]: JSONValue;
}

export type JSONValue = string | number | boolean | JSONValue[] | JSONObject;

import { JSONPath } from 'jsonpath-plus';

export const extractValuesFromObject = (jsonPathMappings: JsonPathMapping, obj: JSONObject): JSONObject =>{
  const result: { [key: string]: any } = {};

  const extractObjectValue = (jsonPath: string, obj: JSONObject): JSONValue | undefined => {
    const extractedValues = JSONPath({ path: jsonPath, json: obj });
    return extractedValues.length > 0 ? extractedValues[0] : undefined;
  };

  for (const key in jsonPathMappings) {
    if (key in Object.keys(jsonPathMappings)) {
      // Extract value from object and store it in the result.
      result[key] = extractObjectValue(jsonPathMappings[key], obj);
    }
  }

  return result;
};
