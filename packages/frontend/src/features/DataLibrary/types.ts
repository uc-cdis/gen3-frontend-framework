export interface Dataset {
  name: string;
  items: {
    [key: string]: {
      dataset_guid?: string;
      description?: string;
      docsUrl?: string;
      type?: string;
    };
  };
}

export interface Query {
  name: string;
  description?: string;
  type?: string;
  schema?: string;
  data?: string;
}

export interface Files {
  name: string;
  description?: string;
  type?: string;
  size?: number;
  guid: string;
}

export interface AdditionalData {
  name: string;
  description: string;
  documentation: string;
}

export interface DataLibraryList {
  name: string;
  setList: SetList[];
}

export interface SetList {
  name: string;
  queries: Query[];
  files: File[];
  additionalData: AdditionalData[];
}
