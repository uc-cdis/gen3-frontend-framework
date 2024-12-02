export interface JobStatus {
  uid: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Unknown';
  name: string;
  error?: string;
}

export interface JobOutput {
  output: string;
}

interface ActionConfig {
  action: string;
  params: Record<string, any>;
}

export interface TwoPartActionConfig {
  part1: ActionConfig;
  part2?: ActionConfig;
}

export interface JobWithActions {
  jobId: string;
  config: TwoPartActionConfig;
  part: 1 | 2;
  timestamp: number;
}
