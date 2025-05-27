import React from 'react';
import { Group, Stack } from '@mantine/core';
import RequestsTable from '../Requests/RequestsTable';
import ProtectedContent from '../../../components/Protected/ProtectedContent';

const RequestsPanel = () => {
  return (
    <ProtectedContent>
      <Stack className="w-100 m-2">
        <Group className="w-100 bg-base-light p-4">
          <RequestsTable />
        </Group>
      </Stack>
    </ProtectedContent>
  );
};
export default RequestsPanel;
