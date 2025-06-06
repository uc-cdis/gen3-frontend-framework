import React from 'react';
import { Group, Stack } from '@mantine/core';
import SavedCohortsTable from './SavedCohortsTable';
import { IndexResourceField } from '../types';

interface SavedCohortsPanelProps {
  indexResources: IndexResourceField;
}

const SavedCohortsPanel = ({ indexResources }: SavedCohortsPanelProps) => {
  return (
    <>
      <Stack className="w-100 m-2">
        <Group className="w-100 bg-base-light p-4">
          <SavedCohortsTable indexResources={indexResources} />
        </Group>
      </Stack>
    </>
  );
};

export default SavedCohortsPanel;
