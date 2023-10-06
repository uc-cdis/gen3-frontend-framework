import { isOperationWithField } from '../utils';
import { Includes, Union }from '../types';

describe('test Operation type guards', () => {

    const includes : Includes = {
        operator: 'in',
        field: 'test_field',
        operands: []
    };

    const union : Union = {
        operator: 'or',
        operands: []
    };

    test('test hasFieldMember', () => {
        expect(isOperationWithField(includes)).toEqual(true);
        expect(isOperationWithField(union)).toEqual(false);
    });
});
