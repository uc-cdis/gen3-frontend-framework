import type {
  FhirSearchParams,
  ParamDef,
  ParamType,
  ResourceDef,
} from '@gen3/core';
import { EXTRA_PARAMS, MAX_COUNT } from './constants';

// One row in the query params table.
export interface ParamRow {
  id: string;
  name: string;
  type: ParamType;
  value: string;
  enabled: boolean;
  // Date rows only, e.g. "ge"
  prefix?: string;
}

export const newRow = (param: ParamDef): ParamRow => ({
  id: crypto.randomUUID(),
  name: param.name,
  type: param.type,
  value: '',
  enabled: true,
  ...(param.type === 'date' ? { prefix: 'eq' } : {}),
});

// Any param can repeat (repeated key = AND), except _count (page size) and _id
// (one per resource). https://hl7.org/fhir/R4/search.html#combining
export const canRepeat = (param: ParamDef): boolean =>
  param.name !== '_count' && param.name !== '_id';

// For the row's + button: puts the new row right below the clicked one
export const addAnother = (
  rows: ParamRow[],
  id: string,
  added: ParamRow,
): ParamRow[] => {
  const i = rows.findIndex((row) => row.id === id);
  if (i === -1) return rows;
  return [...rows.slice(0, i + 1), added, ...rows.slice(i + 1)];
};

// For Add Parameter: puts the new rows at the end
export const addRows = (rows: ParamRow[], added: ParamRow[]): ParamRow[] => [
  ...rows,
  ...added,
];

export const updateRow = (
  rows: ParamRow[],
  id: string,
  changes: Partial<ParamRow>,
): ParamRow[] =>
  rows.map((row) => (row.id === id ? { ...row, ...changes } : row));

export const removeRow = (rows: ParamRow[], id: string): ParamRow[] =>
  rows.filter((row) => row.id !== id);

export const setAllEnabled = (rows: ParamRow[], enabled: boolean): ParamRow[] =>
  rows.map((row) => ({ ...row, enabled }));

// Extras first, then the server's params A to Z, minus composites (MVP).
// Undefined until /metadata loads, or if it doesn't list the type.
export const paramsFor = (
  capability: ResourceDef[] | undefined,
  resource: string,
): ParamDef[] | undefined => {
  const def = capability?.find((r) => r.type === resource);
  if (!def) return undefined;
  // filter copies, so sort won't mutate RTK Query's frozen cache
  const sorted = def.params
    .filter((p) => p.type !== 'composite')
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...EXTRA_PARAMS, ...sorted];
};

// FHIR dates can be partial: 1990, 1990-05 or 1990-05-14
// https://hl7.org/fhir/R4/datatypes.html#date
const DATE_FORMAT = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const dateError = (value: string): string | undefined => {
  const match = DATE_FORMAT.exec(value);
  if (!match) return 'Use YYYY, YYYY-MM or YYYY-MM-DD';
  // A month or day that's left out can't be out of range
  const [year, month, day] = match.slice(1).map((part) => Number(part ?? 1));
  if (year < 1 || month < 1 || month > 12) return 'Not a real date';
  const lastDay =
    month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
  if (day < 1 || day > lastDay) return 'Not a real date';
  return undefined;
};

// 0 is valid FHIR (count only), but it lists nothing, so the UI asks for 1+
const countError = (value: string): string | undefined => {
  if (!/^\d+$/.test(value) || Number(value) < 1)
    return `Use a whole number from 1 to ${MAX_COUNT}`;
  if (Number(value) > MAX_COUNT)
    return `Max ${MAX_COUNT} per page (the server's limit)`;
  return undefined;
};

// Why this row's value can't be sent. Empty values are fine: they're skipped.
export const rowError = (row: ParamRow): string | undefined => {
  const value = row.value.trim();
  if (!value) return undefined;
  if (row.name === '_count') return countError(value);
  if (row.type === 'date') return dateError(value);
  return undefined;
};

// Skips unchecked and empty rows. Repeated keys become arrays, sent as AND.
export const rowsToParams = (rows: ParamRow[]): FhirSearchParams => {
  const params: Record<string, string[]> = {};
  for (const row of rows) {
    const value = row.value.trim();
    if (!row.enabled || !value) continue;
    (params[row.name] ??= []).push(`${row.prefix ?? ''}${value}`);
  }
  return params;
};
