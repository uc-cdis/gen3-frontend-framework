interface CrosswalkInfo {
  id: string;
  name: string;
  description?: string;
  dataPath: string;
}

export interface CrosswalkMapping {
  source: CrosswalkInfo;
  external: Array<CrosswalkInfo>;
}

export interface CrosswalkConfig {
  mapping: CrosswalkMapping;
}
