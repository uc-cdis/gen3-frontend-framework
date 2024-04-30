

export interface ProjectTableColumn {
  name: string;
  field: string;
  errorIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
}


export interface ProjectTableConfig {
  columns: ProjectTableColumn[];
}

export interface SubmissionConfig {
  projectTable: ProjectTableConfig;
}
