// Holds basic types for the Data Dictionary feature

import { JSONObject } from '@gen3/core';

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

interface AnyOf {
  additionalProperties?: boolean;
  items?: Record<string, string | number | boolean>;
  properties?: Record<string, any>;
  type: string;
}

export interface DictionaryProperty {
  description?: string;
  type?: string;
  oneOf?: Record<string, string>[];
  anyOf?: AnyOf[];
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

export type DataDictionary = Record<string, DictionaryEntry>;

export interface DictionaryNode extends Record<string, unknown> {
  id: string;
  category: string;
}

export interface DictionaryCategory<T> {
  [key: string]: T;
}

export type ViewType = 'table' | 'graph';

export interface DictionaryConfigProps {
  config?: Record<string, any>;
  dictionary: DataDictionary;
}

export interface DictionaryProps extends DictionaryConfigProps {
  uidForStorage?: string;
}

export interface DictionarySearchDocument {
  id: string;
  description: string;
  property: string;
  type: string | string[];
}
