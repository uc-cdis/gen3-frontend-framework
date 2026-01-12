import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONArray
  | JSONObject;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONArray = JSONValue[];

// type guard functions
export const isHistogramRangeData = (key: any): key is [number, number] => {
  return (
    Array.isArray(key) &&
    key.length === 2 &&
    key.every((item) => typeof item === 'number')
  );
};

export const isJSONObject = (data: any): data is JSONObject => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};

export const isJSONValue = (data: unknown): data is JSONValue => {
  return (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean' ||
    (Array.isArray(data) && data.every(isJSONValue)) ||
    isJSONObject(data)
  );
};

export const isJSONValueArray = (data: JSONValue): data is JSONArray => {
  return Array.isArray(data) && data.every(isJSONValue);
};

export interface HistogramData {
  key: string | [number, number];
  count: number;
}

export interface HistogramDataAsStringKey {
  key: string;
  count: number;
}

export type HistogramDataArray = Array<HistogramData>;

export interface StatValues {
  count: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  sum: number | null;
  stddev: number | null;
  median: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
}

export type StatsValuesArray = Array<Partial<StatValues>>;

const isValidObject = (input: any): boolean =>
  typeof input === 'object' && input !== null;

export const isHistogramData = (data: any): data is HistogramData => {
  return isValidObject(data) && 'key' in data && 'count' in data;
};

export const isHistogramDataArray = (input: any): input is HistogramData[] => {
  if (!isValidObject(input) || !Array.isArray(input.histogram)) {
    return false;
  }
  return input.histogram.every(isHistogramData);
};

export interface HistogramDataCollection {
  histogram: HistogramDataArray;
}

export const isHistogramDataCollection = (
  obj: any,
): obj is HistogramDataCollection => {
  return (
    isValidObject(obj) && 'histogram' in obj && isHistogramData(obj.histogram)
  );
};

export interface GuppyAggregationData {
  [key: string]: HistogramDataCollection;
}

// Type guard function for GuppyAggregationData interface
export const isGuppyAggregationData = (
  obj: any,
): obj is GuppyAggregationData => {
  if (!isValidObject(obj)) return false;

  for (const key in obj) {
    if (!isHistogramDataCollection(obj[key])) {
      return false;
    }
  }

  return true;
};

export const isHistogramDataAnEnum = (data: unknown): data is HistogramData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'key' in data &&
    'count' in data &&
    typeof data.key === 'string' &&
    typeof data.count === 'number'
  );
};

export const isStatsValue = (item: unknown): item is Partial<StatValues> => {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  // Check that all present properties have correct types
  const numericFields = [
    'count',
    'min',
    'max',
    'avg',
    'sum',
    'stddev',
    'median',
  ];
  for (const field of numericFields) {
    if (field in obj && typeof obj[field] !== 'number') {
      return false;
    }
  }

  // Check percentiles structure if present
  if ('percentiles' in obj) {
    const percentiles = obj.percentiles;
    if (typeof percentiles !== 'object' || percentiles === null) {
      return false;
    }
    const pObj = percentiles as Record<string, unknown>;
    const requiredPercentiles = ['p25', 'p50', 'p75'];
    for (const p of requiredPercentiles) {
      if (p in pObj && typeof pObj[p] !== 'number') {
        return false;
      }
    }
  }

  return true;
};

export const isStatsValuesArray = (data: unknown): data is StatsValuesArray => {
  return Array.isArray(data) && data.every(isStatsValue);
};

export const isHistogramDataAArray = (
  data: any,
): data is HistogramDataArray => {
  return Array.isArray(data) && data.every(isHistogramData);
};

export const isHistogramDataArrayAnEnum = (data: any): boolean => {
  return Array.isArray(data) && data.every(isHistogramDataAnEnum);
};

export const isHistogramDataArrayARange = (data: any): boolean => {
  return (
    Array.isArray(data) && data.every((item) => isHistogramRangeData(item.key))
  );
};

/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(
  error: unknown,
): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

interface ParsingError {
  status: 'PARSING_ERROR';
  originalStatus: number;
  data: string;
  error: string;
}

export interface HttpError {
  status: number;
  data: unknown;
}

export function isHttpStatusError(error: unknown): error is HttpError {
  return (
    typeof error === 'object' &&
    error != null &&
    'status' in error &&
    typeof error.status === 'number'
  );
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isFetchParseError(error: unknown): error is ParsingError {
  return (
    typeof error === 'object' &&
    error != null &&
    'originalStatus' in error &&
    'status' in error &&
    error['status'] === 'PARSING_ERROR'
  );
}

export type AggregationsData = Record<string, HistogramDataArray>;

export type StatsData = Record<string, StatsValuesArray>;

/**
 *  Represents the results of a guppy aggregation query
 */
export interface GuppyAggregationsResponse {
  _aggregation: Record<string, AggregationsData>;
}

/**
 * Represents a manifest item.
 * @interface ManifestItem
 */
export interface ManifestItem {
  [k: string]: string | number | boolean | string[] | undefined;
  object_id: string;
  file_size?: number;
  file_name?: string;
}

export interface StorageOperationResults {
  isError?: boolean;
  status: number;
  message: string;
}

export interface DataFetchingResult<T> extends DataFetchingStatus {
  readonly data: T;
}

export interface DataFetchingStatus {
  readonly isSuccess?: boolean;
  readonly isFetching?: boolean;
  readonly isError?: boolean;
  readonly isUninitialized?: boolean;
  readonly error?: string;
}

export type DataFetchingHook<T> = () => DataFetchingResult<T>;
