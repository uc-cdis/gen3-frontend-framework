export interface TitleAndDescription {
  title: string;
  description?: string;
}

// TODO: change from optional to required
export interface ConfigVersionAndName {
  configVersion?: string;
  name?: string;
}

export interface SortBy {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}
