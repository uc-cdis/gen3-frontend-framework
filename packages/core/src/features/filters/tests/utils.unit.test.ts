import {
  isOperationWithField,
  isOperatorWithFieldAndArrayOfOperands,
} from '../filters';
import { findParentOfOperation } from '../utils';
import type {
  Equals,
  ExcludeIfAny,
  Excludes,
  Includes,
  Intersection,
  NestedFilter,
  Union,
} from '../types';

describe('test Operation type guards', () => {
  const includes: Includes = {
    operator: 'in',
    field: 'test_field',
    operands: [],
  };

  const union: Union = {
    operator: 'or',
    operands: [],
  };

  test('hasFieldMember', () => {
    expect(isOperationWithField(includes)).toEqual(true);
    expect(isOperationWithField(union)).toEqual(false);
  });

  test.each([
    includes,
    { ...includes, operator: 'includes' } as Includes,
    {
      operator: 'excludes',
      field: 'test_field',
      operands: [],
    } as Excludes,
    {
      operator: 'excludeifany',
      field: 'test_field',
      operands: [],
    } as ExcludeIfAny,
  ])('recognizes operations with a field and operand array', (operation) => {
    expect(isOperatorWithFieldAndArrayOfOperands(operation)).toBe(true);
  });

  test('rejects logical operations without a field', () => {
    expect(isOperatorWithFieldAndArrayOfOperands(union)).toBe(false);
  });
});

describe('findParentOfOperation', () => {
  const equals: Equals = { operator: '=', field: 'a', operand: 1 };
  const includes: Includes = { operator: 'in', field: 'b', operands: ['x'] };
  const deepLeaf: Equals = { operator: '=', field: 'c', operand: 'deep' };
  const nestedInner: Union = { operator: 'or', operands: [deepLeaf] };
  const nested: NestedFilter = {
    operator: 'nested',
    path: 'p',
    operand: nestedInner,
  };
  const root: Intersection = {
    operator: 'and',
    operands: [equals, includes, nested],
  };

  test('returns null when the node is the root', () => {
    expect(findParentOfOperation(root, root)).toBeNull();
  });

  test('returns root for a direct child', () => {
    expect(findParentOfOperation(equals, root)).toBe(root);
    expect(findParentOfOperation(includes, root)).toBe(root);
    expect(findParentOfOperation(nested, root)).toBe(root);
  });

  test('returns the nested filter as parent of its operand', () => {
    expect(findParentOfOperation(nestedInner, root)).toBe(nested);
  });

  test('finds parent of a deeply nested node', () => {
    expect(findParentOfOperation(deepLeaf, root)).toBe(nestedInner);
  });

  test('returns null when the node is not in the tree', () => {
    const other: Equals = { operator: '=', field: 'z', operand: 0 };
    expect(findParentOfOperation(other, root)).toBeNull();
  });

  test('matches by reference, not by value', () => {
    const copy: Equals = { ...equals };
    expect(findParentOfOperation(copy, root)).toBeNull();
  });

  test('returns null for a leaf root', () => {
    expect(findParentOfOperation(equals, equals)).toBeNull();
    expect(findParentOfOperation(includes, equals)).toBeNull();
  });

  test('handles empty operands', () => {
    const empty: Union = { operator: 'or', operands: [] };
    expect(findParentOfOperation(equals, empty)).toBeNull();
  });
});
