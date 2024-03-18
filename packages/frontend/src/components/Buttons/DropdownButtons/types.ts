export interface DownloadButtonProps {
  enabled?:boolean;
  type?: string;
  title: string;
  actionTitle?: string; // string to show when action is in progress
  leftIcon?: string;
  rightIcon?: string;
  tooltipText?: string;
  action?: string;
  actionArgs?: Record<string, string>;
}

export interface DropdownButtonProps extends Omit<DownloadButtonProps, 'action' |'actionArgs'> {
  dropdownItems: ReadonlyArray<Partial<DownloadButtonProps>>;
}
