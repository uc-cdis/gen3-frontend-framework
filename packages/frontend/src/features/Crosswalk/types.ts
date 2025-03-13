export interface CrosswalkName {
  id: string; // id of corsswalk entry
  label: string; // label for the table column
  description?: string; // TODO: optional description that will show up as a tooltip
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
