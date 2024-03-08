import { ReactElement, ReactNode } from 'react';

export type JSONValue =
  | string
  | number
  | boolean
  | JSONValue[]
  | JSONObject

export type JSONValueWithReact = JSONValue | ReactElement | ReactNode;

export interface JSONObject {
  [k: string]: JSONValue;
}
export type JSONArray = Array<JSONValue>;

export interface HistogramData  {
  key: string | [number, number];
  count: number;
}

// type guard functions
export const isHistogramRangeData = (key: any): key is [number, number] => {
  return Array.isArray(key) && key.length === 2 && key.every((item) => typeof item === 'number');
};

export const isJSONObject = (data: any): data is JSONObject => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};

export const isJSONValue = (data: any): data is JSONValue => {
  return (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean' ||
    Array.isArray(data) && data.every(isJSONValue) ||
    isJSONObject(data)
  );
};

export type HistogramDataArray = Array<HistogramData>;

export const isHistogramData = (data: any): data is HistogramData => {
  return typeof data === 'object' && data !== null && 'key' in data && 'count' in data;
};

export const isHistogramDataAnEnum = (data: any): data is HistogramData => {
  return typeof data.key === 'string' && typeof data.count === 'number';
};

export const isHistogramDataAArray = (data: any): data is HistogramDataArray => {
  return Array.isArray(data) && data.every(isHistogramData);
};

export const isHistogramDataArrayAnEnum = (data: any): boolean => {
  return Array.isArray(data) && data.every(isHistogramDataAnEnum);
};

export const isHistogramDataArrayARange = (data: any): boolean => {
  return Array.isArray(data) && data.every((item) => isHistogramRangeData(item.key));
};

export type AggregationsData = Record<string, HistogramDataArray>;
