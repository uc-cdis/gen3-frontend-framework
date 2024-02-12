export interface DownloadButtonProps {
  enabled?:boolean;
  type: string;
  title: string;
  leftIcon?: string;
  rightIcon?: string;
  tooltipText?: string;
  action?: string;
  actionArgs?: Record<string, string>;
}

export interface DropdownButtonsProps {
  readonly title: string;
  buttons: ReadonlyArray<Partial<DownloadButtonProps>>;
}
