import {
  isArray,
  isNotDefined,
  isObject,
  isString,
} from '../../utils/ts-utils';
import type { ParamDef, ParamType, ResourceDef } from './types';

// Abstract base types. The server lists them, but you can't query them.
const ABSTRACT_TYPES = new Set(['Resource', 'DomainResource']);

const PARAM_TYPES = new Set<string>([
  'string',
  'token',
  'date',
  'number',
  'quantity',
  'reference',
  'uri',
  'composite',
] satisfies ParamType[]);

// isObject is true for null and arrays, so rule those out too
const isRecord = (x: unknown): x is Record<string, unknown> =>
  !isNotDefined(x) && isObject(x) && !isArray(x);

const asList = (x: unknown): ReadonlyArray<unknown> => (isArray(x) ? x : []);

const isParamType = (x: unknown): x is ParamType =>
  isString(x) && PARAM_TYPES.has(x);

const toParamDef = (sp: unknown): ParamDef[] =>
  isRecord(sp) && isString(sp.name) && isParamType(sp.type)
    ? [{ name: sp.name, type: sp.type }]
    : [];

/**
 * Pulls resource types and their search params out of /metadata. Never throws;
 * anything missing or malformed is skipped. This server doesn't send
 * resourceType, so don't check for it.
 */
export function parseCapability(cs: unknown): ResourceDef[] {
  if (!isRecord(cs)) return [];
  const rest = asList(cs.rest)[0];
  if (!isRecord(rest)) return [];

  return asList(rest.resource).flatMap((r): ResourceDef[] => {
    if (!isRecord(r) || !isString(r.type) || ABSTRACT_TYPES.has(r.type))
      return [];
    return [
      { type: r.type, params: asList(r.searchParam).flatMap(toParamDef) },
    ];
  });
}
