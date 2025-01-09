export interface MetadataElement {
  id: string;
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  required: boolean;
  description: string;
  enum?: string[];
  maximum?: number;
  minimum?: number;
}

export interface MetadataPropertiesConfiguration {
  label: string;
  schemaName: string;
}
