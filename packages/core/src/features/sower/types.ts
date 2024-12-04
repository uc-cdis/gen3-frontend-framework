export type SowerJobState = 'Running' | 'Completed' | 'Failed' | 'Unknown';

export interface JobStatus {
  uid: string;
  status: SowerJobState;
  name: string;
  error?: string;
}

export interface ActionParams<T extends Record<string, any>> {
  parameters: T; // query parameters for the action
  onStart?: () => void; // function to call when the action starts
  onDone?: (arg?: T) => void; // function to call when the action is done
  onError?: (error: Error) => void; // function to call when the action fails
  onAbort?: () => void; // function to call when the download is aborted
  signal?: AbortSignal; // optional signal to stop a fetch
}

export type ActionFunction<
  T extends Record<string, any> = Record<string, any>,
  R extends Record<string, any> | void = Record<string, any>,
> = ({
  parameters,
  onStart,
  onDone,
  onError,
  onAbort,
}: ActionParams<T>) => Promise<R>;

export type JobBuilderAction = (
  params: Record<string, unknown>,
) => DispatchJobParams;

export type SendJobOutputAction = ActionFunction<Record<string, unknown>, void>;

interface ActionFunctionConfig {
  actionName: string;
  parameters: Record<string, unknown>;
}

interface BoundActionConfig<T> extends ActionFunctionConfig {
  actionFunction: T;
}

export interface CreateAndExportActionConfig {
  createAction: ActionFunctionConfig;
  sendJobAction: ActionFunctionConfig;
}

export interface BoundCreateAndExportAction {
  createAction: BoundActionConfig<JobBuilderAction>;
  sendJobAction: BoundActionConfig<SendJobOutputAction>;
}

export interface JobWithActions {
  jobId: string;
  config: CreateAndExportActionConfig;
  part: 1 | 2;
  created: number;
  updated: number;
  name: string;
  status: SowerJobState;
}

export interface DispatchJobParams {
  action: string;
  input: Record<string, any>;
}

export interface DispatchJobResponse {
  uid: string;
  name: string;
  status: string;
}
