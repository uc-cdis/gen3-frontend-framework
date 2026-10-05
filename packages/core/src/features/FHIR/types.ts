// FHIR search param types. R4 also has "special"; this server doesn't use it.
export type ParamType =
  | 'string'
  | 'token'
  | 'date'
  | 'number'
  | 'quantity'
  | 'reference'
  | 'uri'
  | 'composite';

export interface ParamDef {
  name: string;
  type: ParamType;
}

export interface ResourceDef {
  type: string;
  params: ParamDef[];
}

// Only the FHIR fields we actually read. Everything else is still there, just
// typed as unknown until we need it.
export interface FhirResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

// This server sends no previous or last link, so find links by relation.
export interface BundleLink {
  relation: string;
  url: string;
}

export interface BundleEntry {
  resource?: FhirResource;
}

export interface Bundle {
  resourceType: 'Bundle';
  total?: number;
  link?: BundleLink[];
  entry?: BundleEntry[];
}
