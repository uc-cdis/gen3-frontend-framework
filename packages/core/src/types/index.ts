import { ReactElement, ReactNode } from 'react';

export type JSONValue =
  | string
  | number
  | boolean
  | JSONValue[]
  | JSONObject
  | ReactElement

export type JSONValueWithReact = JSONValue  | ReactNode;

export interface JSONObject {
  [k: string]: JSONValue;
}
export type JSONArray = Array<JSONValue>;

export interface HistogramData  {
  key: string | [number, number];
  count: number;
}

export type HistogramDataArray = Array<HistogramData>;

export type AggregationsData = Record<string, HistogramDataArray>;
