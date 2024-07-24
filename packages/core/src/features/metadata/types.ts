export interface CrosswalkEntry {
  fromId: string;
  matches: Record<string, string | undefined>;
}

export interface IndexedMetadataFilters {
  limit: number;
  keys: string[];
}

export interface CrosswalkInfo {
  readonly from: string;
  readonly to: Record<string, string>;
}
