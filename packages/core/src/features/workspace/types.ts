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

export interface WorkspaceInfo {
  id: string;
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

export interface WorkspaceStatusResponse {
  status: string;
  conditions: any | null; // todo change any
  containerStates: any | null; // here too
  idleTimeLimit: number;
  lastActivityTime: number;
  workspaceType: string;
}
