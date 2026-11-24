import { JSONArray, JSONObject } from '../../types';
import { FILE_DELIMITERS } from '../../constants';
import Papa, { UnparseConfig } from 'papaparse';

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isTraversable = (x: unknown): x is object =>
  x !== null &&
  typeof x === 'object' &&
  (Array.isArray(x) || Object.getPrototypeOf(x) === Object.prototype) &&
  Object.keys(x).length > 0;

/**
 * Flattens a nested object/array into a single level object whose keys are the
 * path to each value joined by the delimiter, e.g. { a: { b: [1] } } -> { a_b_0: 1 }.
 * Empty objects and arrays are kept as values. Replaces the `flat` package.
 * @param target - value to flatten
 * @param delimiter - key separator, defaults to '_'
 */
export function flattenObject(
  target: unknown,
  delimiter = '_',
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  const step = (obj: object, prefix: string) => {
    Object.entries(obj).forEach(([key, value]) => {
      if (UNSAFE_KEYS.has(key)) return;
      const path = prefix ? `${prefix}${delimiter}${key}` : key;
      if (isTraversable(value)) {
        step(value, path);
      } else {
        output[path] = value;
      }
    });
  };

  // Object() wraps primitives (a string yields index keys), matching `flat`
  step(Object(target), '');
  return output;
}

/**
 * Flattens a deep nested JSON object skipping
 * the first level to avoid potentially flattening
 * non-nested data.
 * @param {JSON} json
 */
export function flattenJson(json: JSONObject) {
  const flattenedJson: JSONArray = [];
  Object.keys(json).forEach((key) => {
    flattenedJson.push(flattenObject(json[key], '_') as JSONObject);
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
 * Defaults to JSON if file format is not supported.
 * @param {JSON} json
 * @param {string} format
 */
export async function jsonToFormat(
  json: JSONObject,
  format: keyof typeof FILE_DELIMITERS,
) {
  if (Object.keys(FILE_DELIMITERS).includes(format)) {
    const flatJson = flattenJson(json);
    const data = await conversion(flatJson, {
      delimiter: FILE_DELIMITERS[format] as string,
    });
    return data;
  }
  return json;
}
