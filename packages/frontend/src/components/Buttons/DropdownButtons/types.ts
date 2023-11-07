export interface DownloadButtonProps {
  enabled?:boolean;
  type: string;
  title: string;
  leftIcon?: string;
  rightIcon?: string;
  fileName: string;
  tooltipText?: string;
}

export interface DropdownButtonsProps {
  readonly title: string;
  buttons: ReadonlyArray<Partial<DownloadButtonProps>>;
}
