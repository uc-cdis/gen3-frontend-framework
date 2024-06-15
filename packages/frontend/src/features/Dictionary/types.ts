export interface DictionaryConfig
  extends Record<string, string | number | boolean | undefined> {
  showGraph: boolean;
  showDownloads: boolean;
  historyStorageId: string;
  maxHistoryItems: number;
}

export interface DDLink {
  backref: string;
  label: string;
  multiplicity: string;
  name: string;
  required: boolean;
  target_type?: string;
}

export interface DDLinkWithSubgroup {
  exclusive: boolean;
  required: boolean;
  subgroup: Array<DDLink>;
}

interface Term {
  pattern?: string;
  term?: {
    description: string;
    termDef: {
      cde_id: string;
      cde_version: null | number;
      source: string;
      term: string;
      term_url: string;
    };
  };
  type: string;
}

interface AnyOf {
  additionalProperties?: boolean;
  minItems?: number;
  maxItems?: number;
  items?: Record<string, any>;
  properties?: Record<string, any>;
  type: string;
}

export interface DictionaryProperty {
  description?: string;
  type?: string | string[];
  oneOf?: Record<string, any>[];
  anyOf?: AnyOf[];
  allOf?: Record<string, string | string[]>[];
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
  links?: DDLink[] | DDLinkWithSubgroup[];
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

export type DataDictionary = Partial<{
  _definitions: any;
  _settings: {
    _dict_commit: string;
    _dict_version: string;
    enable_case_cache: boolean;
  };
  _terms: any;
}> &
  Record<string, DictionaryEntry>;

export interface DictionaryNode extends Record<string, unknown> {
  id: string;
  category: string;
}

export interface DictionaryCategory<T> {
  [key: string]: T;
}

export type ViewType = 'table' | 'graph';

export interface DictionaryProps {
  config: DictionaryConfig;
  dictionary: DataDictionary;
}

export interface DictionarySearchDocument {
  id: string;
  description: string;
  property: string;
  type: string | string[];
  category: string;
  rootCategory: string;
}

export interface MatchingSearchResult {
  node: string;
  category: string;
  property: string;
}
