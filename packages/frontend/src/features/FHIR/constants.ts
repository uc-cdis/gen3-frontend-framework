import type { ParamDef } from '@gen3/core';

// The tabs, in the mockup's order. A constant for the MVP.
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

// _count sets the page size, not how many are found. The name misleads
// There's no cap, so it also warns about big pages.
export const COUNT_HINT =
  'Results per page (default 100). Large pages are slow.';

// All 8 date prefixes the server advertises, shaped for Mantine Select
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
