import React from 'react';
import { Group, Stack } from '@mantine/core';
import SavedCohortsTable from './SavedCohortsTable';

const SavedCohortsPanel = () => {
  return (
    <Stack className="w-100 m-2">
      <Group className="w-100 bg-base-light p-4">
        <SavedCohortsTable />
      </Group>
    </Stack>
  );
};
export default SavedCohortsPanel;
