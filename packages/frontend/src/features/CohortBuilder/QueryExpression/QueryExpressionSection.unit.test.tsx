import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import QueryExpressionSection from './QueryExpressionSection';
import { QueryExpressionContext } from './QueryExpressionContext';

jest.mock('../CohortSelector', () => ({
  __esModule: true,
  default: () => null,
}));

describe('QueryExpressionSection', () => {
  it('shows the logical operators represented by the active filters', () => {
    render(
      <MantineProvider>
        <QueryExpressionContext.Provider
          value={{
            displayOnly: false,
            showLogicalOperators: true,
            fieldsAreFlat: true,
            cohortId: null,
            cohortName: 'Test cohort',
            useClearCohortFilters: () => jest.fn(),
            useRemoveFilter: () => jest.fn(),
            useUpdateFilters: () => jest.fn(),
            useSetCohortFilters: () => jest.fn(),
            useGetFilters: () => ({
              mode: 'and',
              root: {
                gender: {
                  operator: 'in',
                  field: 'gender',
                  operands: ['female', 'male'],
                },
                race: {
                  operator: 'in',
                  field: 'race',
                  operands: ['white'],
                },
              },
            }),
            useFormatFilters: () => (value: string) => Promise.resolve(value),
          }}
        >
          <QueryExpressionSection index="case" showTitle={false} />
        </QueryExpressionContext.Provider>
      </MantineProvider>,
    );

    expect(screen.getAllByTestId('query-logical-operator-or')).toHaveLength(1);
    expect(screen.getAllByTestId('query-logical-operator-and')).toHaveLength(1);
  });

  it('keeps logical labels hidden by default', () => {
    render(
      <MantineProvider>
        <QueryExpressionContext.Provider
          value={{
            displayOnly: false,
            fieldsAreFlat: true,
            cohortId: null,
            cohortName: 'Test cohort',
            useClearCohortFilters: () => jest.fn(),
            useRemoveFilter: () => jest.fn(),
            useUpdateFilters: () => jest.fn(),
            useSetCohortFilters: () => jest.fn(),
            useGetFilters: () => ({
              mode: 'and',
              root: {
                gender: {
                  operator: 'in',
                  field: 'gender',
                  operands: ['female', 'male'],
                },
                race: {
                  operator: 'in',
                  field: 'race',
                  operands: ['white'],
                },
              },
            }),
            useFormatFilters: () => (value: string) => Promise.resolve(value),
          }}
        >
          <QueryExpressionSection index="case" showTitle={false} />
        </QueryExpressionContext.Provider>
      </MantineProvider>,
    );

    expect(screen.queryByTestId(/query-logical-operator/)).toBeNull();
  });
});
