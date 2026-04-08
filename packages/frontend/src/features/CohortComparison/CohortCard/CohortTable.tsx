import React from 'react';
import { Table } from '@mantine/core';
import { CohortComparisonType } from '../types';

const CohortTable = ({
  cohorts,
  counts,
  casesFetching,
}: {
  cohorts: CohortComparisonType;
  counts: number[];
  casesFetching: boolean;
}) => {
  const formatCount = (index: number) => {
    if (casesFetching || counts.length === 0) return '...';
    return counts[index] ? counts[index].toLocaleString() : '0';
  };

  return (
    <Table withTableBorder withColumnBorders>
      <Table.Thead className="bg-base-max">
        <Table.Tr>
          <Table.Th className="text-primary-dark">Cohort</Table.Th>
          <Table.Th className="text-primary-dark text-right"># Cases</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {cohorts && (
          <>
            <Table.Tr
              className="bg-base-lightest"
              data-testid="text-first-cohort-cohort-comparison"
            >
              <Table.Td
                className="font-bold text-mmrf-plum"
                data-testid="text-cohort-name-cohort-comparison"
              >
                {cohorts.primary_cohort?.name}
              </Table.Td>
              <Table.Td
                className="text-right text-base-contrast"
                data-testid="text-cohort-case-count-cohort-comparison"
              >
                {formatCount(0)}
              </Table.Td>
            </Table.Tr>
            <Table.Tr
              className="bg-base-max"
              data-testid="text-second-cohort-cohort-comparison"
            >
              <Table.Td
                className="font-bold text-mmrf-rust"
                data-testid="text-cohort-name-cohort-comparison"
              >
                {cohorts.comparison_cohort?.name}
              </Table.Td>
              <Table.Td
                className="text-right text-base-contrast"
                data-testid="text-cohort-case-count-cohort-comparison"
              >
                {formatCount(1)}
              </Table.Td>
            </Table.Tr>
          </>
        )}
      </Table.Tbody>
    </Table>
  );
};

export default CohortTable;
