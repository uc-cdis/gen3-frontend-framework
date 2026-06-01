import { Gen3AppConfigData } from '../../lib/content/types';
import { FormProps } from '../../components/Content/Form';
import { Config403Props } from '../../pages/403/types';
import { RemoteSupportConfiguration } from '@gen3/core';

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

export enum PayModelStatus {
  GETTING = 'GETTING',
  INVALID = 'INVALID',
  ERROR = 'ERROR',
  NOT_SELECTED = 'NOT_SELECTED',
  OVER_LIMIT = 'OVER_LIMIT',
  NOT_REQUIRED = 'NOT_REQUIRED',
  VALID = 'VALID',
}

export interface LaunchStepIndicatorConfiguration {
  steps: Array<{
    label: string;
    description?: string;
  }>;
}

export interface SupportServiceConfiguration {
  service: string;
  subject?: string;
  configuration: RemoteSupportConfiguration;
}

export interface requestAccessFormProps extends Omit<FormProps, 'body'> {
  enabled: boolean;
  label: string;
  form: FormProps['body'];
  success: Config403Props;
  remoteSupportService: SupportServiceConfiguration;
}

export interface WorkspaceConfig extends Gen3AppConfigData {
  workspaceInfo?: Record<string, WorkspaceAdditionalInfo>;
  launchStepIndicatorConfig: LaunchStepIndicatorConfiguration;
  requirePayModel?: boolean;
  externalLoginsNotUsed?: boolean;
  requestAccessForm?: requestAccessFormProps;
}
