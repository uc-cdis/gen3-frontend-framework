// Holds basic types for the Data Dictionary feature

interface BaseDictionary extends Record<string, any> {
  id: string;
  category: string;
  description: string;
  properties: Record<string, unknown>;
}

export type DataDictionary = Partial<BaseDictionary>;

export interface DictionaryNode extends Record<string, unknown> {
  id: string;
  category: string;
}
