export interface ProjectTableColumn {
  name: string;
  field: string;
  errorIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
}

export interface ProjectTableConfig {
  columns: ProjectTableColumn[];
}

export interface DataSubmissionCard {
  title: string;
  subtitle: string;
  text: string;
  icon: string;
}

export interface SubmissionConfig {
  dataSubmissionCards: DataSubmissionCard[];
  projectTable: ProjectTableConfig;
  docLinkLocation: string;
  docLinkText: string;
}
