import React, { isValidElement, ReactElement } from 'react';
import type { Intersection } from '@gen3/core';
import {
  buildSetOperation,
  convertFilterToComponent,
} from './QueryRepresentation';

describe('buildSetOperation', () => {
  it('builds the existing match-any operation by default', () => {
    expect(buildSetOperation('criteria', 'in', ['one', 'two'], 'or')).toEqual({
      operator: 'in',
      field: 'criteria',
      operands: ['one', 'two'],
    });
  });

  it('builds one intersected include per value for match-all', () => {
    expect(buildSetOperation('criteria', 'in', ['one', 'two'], 'and')).toEqual({
      operator: 'and',
      operands: [
        { operator: 'in', field: 'criteria', operands: ['one'] },
        { operator: 'in', field: 'criteria', operands: ['two'] },
      ],
    });
  });
});

describe('convertFilterToComponent', () => {
  it('renders a same-field enum intersection as a match-all query element', () => {
    const filter: Intersection = {
      operator: 'and',
      operands: [
        { operator: 'in', field: 'criteria', operands: ['one'] },
        { operator: 'in', field: 'criteria', operands: ['two'] },
      ],
    };

    const queryElement = convertFilterToComponent(
      filter,
      'case',
    ) as ReactElement<{
      field: string;
      children: ReactElement<{
        combineMode: string;
        operands: Array<string>;
      }>;
    }>;
    expect(isValidElement(queryElement)).toBe(true);
    expect(queryElement.props.field).toBe('criteria');

    const valuesElement = queryElement.props.children;
    expect(valuesElement.props.combineMode).toBe('and');
    expect(valuesElement.props.operands).toEqual(['one', 'two']);
  });
});
