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
  status: 'not ready' | 'processing' | 'error' | 'complete';
  message?: string;
  subSteps?: Array<TitleAndDescription>;
}

export interface LaunchStepIndicatorConfiguration {
  steps: Array<{
    label: string;
    description?: string;
  }>;
}

export interface WorkspaceConfig {
  title?: string;
  workspaceInfo?: Record<string, WorkspaceAdditionalInfo>;
  launchStepIndicatorConfig: LaunchStepIndicatorConfiguration;
}
