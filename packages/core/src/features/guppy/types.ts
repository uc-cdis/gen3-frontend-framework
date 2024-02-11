import { FilterSet } from '../filters';
import { Accessibility } from '../../constants';


// Guppy data request parameters
export interface BaseGuppyDataRequest {
  type: string;
  accessibility?: Accessibility;
  fields: string[];
  sort?: string[];
}

// Represents a request to download data from Guppy and convert it to a specific format.
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
  parameters: T;              // query parameters for the Guppy request
  onStart?: () => void;       // function to call when the download starts
  onDone?: (blob: Blob) => void; // function to call when the download is done
  onError?: (error: Error) => void; // function to call when the download fails
  onAbort?: () => void;      // function to call when the download is aborted
  signal?: AbortSignal;      // AbortSignal to use for the request
}

export interface GuppyDownloadActionFunctionParams extends GuppyDownloadDataParams {
  filename: string;
}

// Function type for Guppy actions
export type GuppyActionFunction<T extends Record<string, any>> = (args:GuppyActionParams<T>) => void;


export type DownloadFromGuppyParams = GuppyActionParams<GuppyDownloadDataParams>;
