import { StylingOverride } from '../../../types/styling';
import type { CreateAndExportActionConfig } from '@gen3/core';

export interface DownloadButtonProps {
  enabled?: boolean;
  type?: string;
  title: string;
  actionTitle?: string; // string to show when action is in progress
  leftIcon?: string;
  rightIcon?: string;
  tooltipText?: string;
  action?: string;
  actionArgs?: Record<string, string>;
  classNames?: StylingOverride;
}

export interface DispatchJobButtonProps
  extends Omit<DownloadButtonProps, 'action' | 'actionArgs'> {
  actions: CreateAndExportActionConfig;
}

export interface DropdownButtonProps
  extends Omit<DownloadButtonProps, 'action' | 'actionArgs'> {
  dropdownItems: ReadonlyArray<Partial<DownloadButtonProps>>;
}
