// Holds basic types for the Data Dictionary feature

export interface DictionaryConfig extends Record<string, any> {
  id: string;
  category: string;
  description: string;
  properties: Record<string, unknown>;
}

export type DataDictionary = Partial<DictionaryConfig>;

export interface DictionaryNode extends Record<string, unknown> {
  id: string;
  category: string;
}

export interface DictionaryProps {
  dictionaryConfig: DictionaryConfig | any;
}

export interface DictionaryCategory<T> {
  [key: string]: T;
}
export interface DDLink {
  backref: string;
  label: string;
  multiplicity: string;
  name: string;
  required: boolean;
}
