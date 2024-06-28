export interface WorkspaceAdditionalInfo {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
}

export interface WorkspaceConfig extends Record<string, any> {
  title?: string;
  workspaceInfo?: Record<string, WorkspaceAdditionalInfo>;
}
