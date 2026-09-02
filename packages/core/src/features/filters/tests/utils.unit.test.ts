import {
  isOperationWithField,
  isOperatorWithFieldAndArrayOfOperands,
} from '../filters';
import { ExcludeIfAny, Excludes, Includes, Union } from '../types';

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
