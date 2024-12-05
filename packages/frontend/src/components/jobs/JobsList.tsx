import React from 'react';
import { Group, Text, Stack, Badge, Paper, Table } from '@mantine/core';
import {
  useCoreSelector,
  selectSowerJobs,
  useGetSowerJobsStatusQuery,
} from '@gen3/core';
import { ErrorCard } from '../MessageCards';

interface JobsListProps {
  size?: string;
}

const JobsList: React.FC<JobsListProps> = ({ size = 'sm' }) => {
  const jobIds = useCoreSelector(selectSowerJobs);
  // const idsArray = Object.keys(jobIds);
  // const {
  //   data: jobStatuses,
  //   isLoading,
  //   isError,
  // } = useGetSowerJobsStatusQuery(idsArray, {
  //   skip: idsArray.length === 0,
  // });

  if (Object.keys(jobIds).length === 0) {
    return (
      <Paper p="md">
        <Text>No Active Jobs</Text>
      </Paper>
    );
  }

  // if (isError) {
  //   return (
  //     <Paper p="md">
  //       <ErrorCard message="Error retrieving jobs" />
  //     </Paper>
  //   );
  // }

  const tableHeader = (
    <Table.Tr>
      <Table.Th>Id</Table.Th>
      <Table.Th>Name</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Created</Table.Th>
      <Table.Th>Updated</Table.Th>
    </Table.Tr>
  );

  const rows = Object.values(jobIds).map((jobStatus) => {
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
        <Table.Td>{new Date(jobStatus.created).toLocaleDateString()}</Table.Td>
        <Table.Td>{new Date(jobStatus.updated).toLocaleDateString()}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>{tableHeader}</Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export default JobsList;
