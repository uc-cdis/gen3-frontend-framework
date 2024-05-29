import { JSONObject } from '../../types';

export interface FetchError<T> {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly text: string;
  readonly request?: T;
}

export interface Gen3FenceResponse<H = JSONObject | string> {
  readonly data: H;
  readonly status: number; // HTTP Status code
}
