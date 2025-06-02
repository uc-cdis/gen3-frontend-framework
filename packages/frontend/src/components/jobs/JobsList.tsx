import React from 'react';
import { Text, LoadingOverlay, Badge, Paper, Table } from '@mantine/core';
import { formatDateFromTimestamp } from '../../utils/date';

import { JobWithActions } from '@gen3/core';

export interface JobsListProps {
  jobs: Record<string, JobWithActions>;
  size?: string;
}

const JobsList = ({ jobs, size = 'sm' }: JobsListProps) => {
  if (Object.keys(jobs).length === 0) {
    return (
      <Paper p="md">
        <Text>No Active Jobs</Text>
      </Paper>
    );
  }

  const tableHeader = (
    <Table.Tr>
      <Table.Th>Id</Table.Th>
      <Table.Th>Name</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Created</Table.Th>
      <Table.Th>Updated</Table.Th>
    </Table.Tr>
  );

  const rows = Object.values(jobs).map((jobStatus) => {
    return (
      <Table.Tr key={jobStatus.jobId}>
        <Table.Td>{jobStatus.jobId}</Table.Td>
        <Table.Td>{jobStatus.name}</Table.Td>
        <Table.Td>
          {' '}
          <Badge
            size={size}
            color={
              jobStatus.status === 'Running'
                ? 'blue'
                : jobStatus.status === 'Completed'
                  ? 'green'
                  : jobStatus.status === 'Failed'
                    ? 'red'
                    : 'gray'
            }
          >
            {jobStatus.status || 'Unknown'}
          </Badge>
        </Table.Td>
        <Table.Td>{formatDateFromTimestamp(jobStatus.created)}</Table.Td>
        <Table.Td>{formatDateFromTimestamp(jobStatus.updated)}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>{tableHeader}</Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default JobsList;
