export interface WorkspaceAdditionalInfo {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
}

interface StatusTitleAndDescription {
  title: string;
  description: string;
}

export type Steps = Array<StatusTitleAndDescription>;

export interface WorkspaceStatusSteps {
  currentStep: number;
  currentStepsStatus: 'process' | 'success' | 'error';
  steps: Steps;
}

export interface WorkspaceConfig extends Record<string, any> {
  title?: string;
  workspaceInfo?: Record<string, WorkspaceAdditionalInfo>;
}
