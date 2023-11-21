import { JSONObject } from '@gen3/core';
import { JSONPath } from 'jsonpath-plus';

export const jsonPathAccessor = (path: string) => (row: JSONObject) => {
  // TODO: add logging if path is not found
  return JSONPath({ json: row, path: path });
};
