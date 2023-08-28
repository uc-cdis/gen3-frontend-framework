import { ReactElement } from 'react';

export type JSONValue =
  | string
  | number
  | boolean
  | JSONValue[]
  | { [key: string]: JSONValue }
  | ReactElement;

export interface JSONObject {
  [k: string]: JSONValue;
}
export type JSONArray = Array<JSONValue>;
