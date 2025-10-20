import React from 'react';
import { Group, Stack } from '@mantine/core';
import RequestsTable from '../Requests/RequestsTable';

const RequestsPanel = () => {
  return (
    <Stack className="w-100 m-2">
      <Group className="w-100 bg-base-light p-4">
        <RequestsTable />
      </Group>
    </Stack>
  );
};
export default RequestsPanel;
