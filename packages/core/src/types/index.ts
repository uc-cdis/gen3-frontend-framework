import { ReactElement, ReactNode } from 'react';

export type JSONValue =
  | string
  | number
  | boolean
  | JSONValue[]
  | { [key: string]: JSONValue }
  | ReactElement

export type JSONValueWithReact = JSONValue  | ReactNode;

export interface JSONObject {
  [k: string]: JSONValue;
}
export type JSONArray = Array<JSONValue>;
