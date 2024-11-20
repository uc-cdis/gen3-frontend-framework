import { JSONObject } from '../../types';

export interface JobStatus {
  uid: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Unknown';
  name: string;
}

export interface JobOutput {
  output: string;
}

export interface Gen3SowerResponse<H = JSONObject | string> {
  readonly data: H;
  readonly status: number; // HTTP Status code
}
