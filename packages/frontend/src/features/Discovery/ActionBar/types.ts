
export  interface ActionButtonConfig {
  readonly label: string;
  readonly icon: string;
  readonly action: (items: Record<string, any> | Array<any>) => void;
}
