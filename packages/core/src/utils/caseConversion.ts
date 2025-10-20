import { camelCase, snakeCase } from 'lodash';

// Utility functions
export const toCamelCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        camelCase(key),
        toCamelCase(value),
      ]),
    );
  }
  return obj;
};

export const toSnakeCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        snakeCase(key),
        toSnakeCase(value),
      ]),
    );
  }
  return obj;
};
