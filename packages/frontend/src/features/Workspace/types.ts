export interface WorkspaceAdditionalInfo {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
}

interface TitleAndDescription {
  title: string;
  description: string;
}

export interface WorkspaceLaunchStatus {
  step: number;
  status: 'not ready' | 'processing' | 'error';
  message?: string;
  subSteps?: Array<TitleAndDescription>;
}

export interface WorkspaceConfig extends Record<string, any> {
  title?: string;
  workspaceInfo?: Record<string, WorkspaceAdditionalInfo>;
}
