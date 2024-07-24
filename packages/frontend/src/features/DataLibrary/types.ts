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
  export interface Datasets {
    [key: string]: Dataset | undefined;
  }

  export interface Query {
    name: string;
    description: string;
    type?: string;
  }

  export interface Files {
    name: string;
    description?: string;
    type?: string;
    size?: number;
  }

  export interface AdditionalData {
    name: string;
    description: string;
    documentation: string;
  }

  export interface DataLibraryList {
    name: string;
    setList: SetList[]
  }

  export interface SetList {
    name: string;
    queries: Query[];
    files: File[];
    additionalData: AdditionalData[];
  }

  export interface ListsTableProps {
      data: any;
      setList: any;
  }
