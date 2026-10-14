import type { ParamDef } from '@gen3/core';

// The resource types shown as tabs, in order. A constant for now.
// This is matching mock up for now - just for MVP.
export const RESOURCE_TABS = [
  'Patient',
  'Observation',
  'Condition',
  'Medication',
  'Encounter',
  'Practitioner',
];

// /metadata doesn't list these per type, but the server supports both.
export const EXTRA_PARAMS: ParamDef[] = [
  // Results per page. Not a search param, so /metadata never lists it.
  { name: '_count', type: 'number' },
  // The resource's id. Only listed on the abstract Resource type, which we drop.
  { name: '_id', type: 'token' },
];

// All 8 prefixes the server advertises for date params
// {value, label} shape is expected by Mantine Select's data
export const DATE_PREFIXES = [
  { value: 'eq', label: 'eq · equals' },
  { value: 'ne', label: 'ne · not equal' },
  { value: 'gt', label: 'gt · after' },
  { value: 'lt', label: 'lt · before' },
  { value: 'ge', label: 'ge · on or after' },
  { value: 'le', label: 'le · on or before' },
  { value: 'sa', label: 'sa · starts after' },
  { value: 'eb', label: 'eb · ends before' },
];
