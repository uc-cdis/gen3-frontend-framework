export interface CrosswalkName {
  id: string;
  label: string;
  description?: string;
}

interface CrosswalkInfo extends CrosswalkName {
  dataPath: string[]; // Needed as some crosswalk keys are URL's
}

export interface CrosswalkMapping {
  source: CrosswalkName;
  external: Array<CrosswalkInfo>;
}

export interface CrosswalkConfig {
  showSubmittedIdInTable?: boolean; // add submitted id column in results table
  mapping: CrosswalkMapping; // mapping configuration for crosswalk
  idEntryPlaceholderText?: string; // Placeholder text for id entry field
}
