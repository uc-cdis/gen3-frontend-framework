export const enum SowerJobStatus {
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Unknown = 'Unknown',
}

export interface JobStatus {
  uid: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Unknown';
  name: string;
}

export interface JobOutput {
  output: string;
}
