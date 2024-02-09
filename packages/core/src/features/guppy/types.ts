import { FilterSet } from '../filters';
import { Accessibility } from '../../constants';

export interface BaseGuppyDataRequest {
  type: string;
  accessibility?: Accessibility;
  fields: string[];
  sort?: string[];
}

export interface GuppyDownloadDataParams extends BaseGuppyDataRequest {
  filter: FilterSet; // cohort filters
  format: 'json' | 'csv' | 'tsv'; // the three supported formats
  rootPath?: string; // a string (minus $.) JSONPath to the root of the data
}

export interface GuppyActionFunctionParams extends Record<string, any> {
  type: string;
  accessibility?: Accessibility;
  fields: string[];
  sort?: string[];
  filter: FilterSet;
}

export interface GuppyActionParams<T extends Record<string, any>> {
  parameters: T;
  onStart?: () => void;
  onDone?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export interface GuppyDownloadActionFunctionParams
  extends GuppyActionFunctionParams {
  format: string;
  filename: string;
}

export type GuppyActionFunction<T extends Record<string, any>> = (
  params: GuppyActionParams<T>,
) => void;
