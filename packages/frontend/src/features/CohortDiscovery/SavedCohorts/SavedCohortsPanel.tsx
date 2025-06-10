import React from 'react';
import { Group, Stack } from '@mantine/core';
import SavedCohortsTable from './SavedCohortsTable';
import { IndexResourceField, SupportServiceConfiguration } from '../types';

interface SavedCohortsPanelProps {
  indexResources: IndexResourceField;
  remoteSupportService: SupportServiceConfiguration;
}

const SavedCohortsPanel = ({ indexResources }: SavedCohortsPanelProps) => {
  return (
    <>
      <Stack className="w-100 m-2">
        <Group className="w-100 bg-base-light p-4">
          <SavedCohortsTable
            indexResources={indexResources}
            remoteSupportService={remoteSupportService}
          />
        </Group>
      </Stack>
    </>
  );
};

export default SavedCohortsPanel;
