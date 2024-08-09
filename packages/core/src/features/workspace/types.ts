export interface PayModel {
  bmh_workspace_id: string;
  workspace_type: string;
  user_id: string;
  account_id: string;
  request_status: string;
  local: boolean;
  region: string;
  ecs: boolean;
  subnet: number;
  'hard-limit': number;
  'soft-limit': number;
  'total-usage': number;
  current_pay_model: boolean;
}

export interface WorkspaceId {
  id: string;
}

export interface WorkspaceInfo extends WorkspaceId {
  name: string;
  idleTimeLimit: number;
  memoryLimit: string;
  cpuLimit: string;
}

export interface WorkspaceInfoResponse {
  id: string;
  name: string;
  'idle-time-limit': number;
  'memory-limit': string;
  'cpu-limit': string;
}

export type WorkspaceOptionsResponse = Array<WorkspaceInfoResponse>;
export type WorkspaceOptions = Array<WorkspaceInfo>;

export interface WorkspacePayModelResponse {
  currentPayModel: PayModel;
  allPayModels: PayModel[];
}

export enum WorkspaceStatus {
  Launching = 'Launching',
  Running = 'Running',
  Terminating = 'Terminating',
  Stopped = 'Stopped',
  'Not Found' = 'Not Found',
}

export enum PodConditionType {
  PodScheduled = 'PodScheduled',
  Initialized = 'Initialized',
  ContainersReady = 'ContainersReady',
  Ready = 'Ready',
}

export enum PodStatus {
  True = 'True',
  False = 'False',
  Unknown = 'Unknown',
}

export interface WorkspaceStatusResponse {
  status: WorkspaceStatus;
  conditions: Array<{
    type: PodConditionType;
    status: PodStatus;
  }>;
  containerStates: Array<{
    name: string;
    description: string;
  }>;
  idleTimeLimit: number;
  lastActivityTime: number;
  workspaceType: string;
}
