// Holds basic types for the Data Dictionary feature

export interface DictionaryConfig extends Record<string, any> {
  id: string;
  category: string;
  description: string;
  properties: Record<string, unknown>;
}

export interface DDLink {
  backref: string;
  label: string;
  multiplicity: string;
  name: string;
  required: boolean;
}

export interface DictionaryProperty {
  description?: string;
  type?: string;
  oneOf?: Record<string, string>[];
  term?: {
    description?: string;
  };
}

export interface DictionaryEntry {
  $schema?: string;
  additionalProperties?: boolean;
  category?: string;
  description?: string;
  id?: string;
  links?: DDLink[];
  namespace?: string;
  nodeTerms?: null | any;
  program?: string;
  project?: string;
  properties?: Record<string, DictionaryProperty>;
  required?: string[];
  submittable?: boolean;
  systemProperties?: string[];
  title?: string;
  type?: string;
  uniqueKeys?: Array<string[]>;
  validators?: null | any;
}

export type DataDictionary = Partial<DictionaryConfig>;

export interface DictionaryNode extends Record<string, unknown> {
  id: string;
  category: string;
}

export interface DictionaryProps {
  dictionaryConfig: DictionaryConfig | any;
  uidForStorage?: string;
}

export interface DictionaryCategory<T> {
  [key: string]: T;
}

export type ViewType = 'table' | 'graph';
