export const enum SowerJobStatus {
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Unknown = 'Unknown',
}

export type JobId = string;

export interface JobStatus {
  uid: JobId;
  status: SowerJobStatus;
  name: string;
  error?: string;
}

export interface JobActionParams<T extends Record<string, any>> {
  parameters: T; // query parameters for the action
  onStart?: () => void; // function to call when the action starts
  onDone?: (arg?: T) => void; // function to call when the action is done
  onError?: (error: Error) => void; // function to call when the action fails
  onAbort?: () => void; // function to call when the download is aborted
  signal?: AbortSignal; // optional signal to stop a fetch
}

export type JobActionFunction<
  T extends Record<string, any> = Record<string, any>,
  R extends Record<string, any> | void = Record<string, any>,
> = ({
  parameters,
  onStart,
  onDone,
  onError,
  onAbort,
}: JobActionParams<T>) => Promise<R>;

export type JobBuilderAction = (
  params: Record<string, unknown>,
) => DispatchJobParameters;

export type JobOutputAction = JobActionFunction<Record<string, unknown>, void>;

export interface JobActionFunctionConfig {
  name: string;
  parameters?: Record<string, unknown>;
}

export interface BoundJobActionConfig<T> extends JobActionFunctionConfig {
  actionFunction: T;
}

// handles Sower job: consist of the sower job action and optionally an action which uses the output of the job
// used in the JobsSlice and is serializable
export interface CreateAndExportOutputConfig {
  jobAction: JobActionFunctionConfig;
  outputAction?: JobActionFunctionConfig;
}

// Bound actions: action that are bound to a function
export interface BoundCreateAndOutputAction {
  dispatchJob: DispatchJobParameters;
  outputActionFunction?: BoundJobActionConfig<JobOutputAction>;
}

export enum SowerJobStage {
  JobDispatched = 1,
  SendJobOutput = 2,
}

export interface JobWithActions {
  uid: string;
  actions: BoundCreateAndOutputAction;
  stage: SowerJobStage;
  created: number;
  updated: number;
  name?: string;
  status: SowerJobStatus;
  outputGUID?: string;
}

export interface DispatchJobParameters {
  action: string;
  input: Record<string, any>;
}

export interface DispatchJobWithAction {
  dispatchJob: DispatchJobParameters;
  outputAction?: BoundJobActionConfig<JobOutputAction>;
}

export interface DispatchJobResponse {
  uid: string;
  name: string;
  status: SowerJobStatus;
}
