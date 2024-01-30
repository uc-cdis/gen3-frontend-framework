import { JSONArray, JSONObject } from "../../types";
import { FILE_DELIMITERS } from '../../constants';
import { flatten } from 'flat';
import Papa, { UnparseConfig } from 'papaparse';

/**
 * Flattens a deep nested JSON object skipping
 * the first level to avoid potentially flattening
 * non-nested data.
 * @param {JSON} json
 */
export function flattenJson(json: JSONObject) {
  const flattenedJson : JSONArray = [];
  Object.keys(json).forEach((key) => {
    flattenedJson.push(flatten(json[key], { delimiter: '_' }));
  });
  return flattenedJson;
}

/**
 * Converts JSON based on a config.
 * @param {JSON} json
 * @param {Object} config
 */
export async function conversion(json: JSONArray, config: UnparseConfig) {
  return Papa.unparse(json, config);
}

/**
 * Converts JSON to a specified file format.
 * Defaultes to JSON if file format is not supported.
 * @param {JSON} json
 * @param {string} format
 */
export async function jsonToFormat(
  json: JSONObject,
  format: keyof typeof FILE_DELIMITERS,
) {
  if (format in FILE_DELIMITERS) {
    const flatJson = await flattenJson(json);
    const data = await conversion(flatJson, {
      delimiter: FILE_DELIMITERS[format] as string,
    } );
    return data;
  }
  return json;
}
