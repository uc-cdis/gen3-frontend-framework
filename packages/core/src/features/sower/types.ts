export const SowerJobStatus = {
  Running: 'Running',
  Completed: 'Completed',
  Failed: 'Failed',
  Unknown: 'Unknown',
};

export type SowerJobStatus =
  (typeof SowerJobStatus)[keyof typeof SowerJobStatus];

export type JobId = string;

// Job Status read from the sower service
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
export interface DispatchedJobWithOutputAction {
  dispatchJob: DispatchJobParameters;
  outputAction?: JobActionFunctionConfig; // output action is optional
}

export enum SowerJobStage {
  JobDispatched = 1,
  SendJobOutput = 2,
}

export interface ExtendedJobStatus extends JobStatus {
  created: number;
  updated: number;
  outputGUID?: string;
}

export interface JobWithActions extends ExtendedJobStatus {
  actions: DispatchedJobWithOutputAction;
  stage: SowerJobStage;
}

export interface DispatchJobParameters {
  action: string;
  input: Record<string, any>;
}

export interface NamedDispatchJobWithAction extends DispatchedJobWithOutputAction {
  name: string;
}

export interface DispatchJobResponse {
  uid: string;
  name: string;
  status: SowerJobStatus;
}
