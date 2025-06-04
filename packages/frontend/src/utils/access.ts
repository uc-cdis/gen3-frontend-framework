import {
  JSONValue,
} from '@gen3/core';

export const accessibleFieldName = '__accessible';

export enum AccessLevel {
  ACCESSIBLE = 1,
  UNACCESSIBLE = 2,
  WAITING = 3,
  NOT_AVAILABLE = 4,
  OTHER = 5,
  MIXED = 6,
}
