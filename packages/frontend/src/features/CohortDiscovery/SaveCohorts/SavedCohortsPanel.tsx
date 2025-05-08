import React, { useState } from 'react';
import { Group, Modal, Stack } from '@mantine/core';
import SavedCohortsTable from './SavedCohortsTable';
import DataAccessRequestForm from '../Requests/DataAccessRequestForm';
import { useDisclosure } from '@mantine/hooks';
import { useAppDispatch } from '../appApi';
import { DataAccessRequestUserInformation } from '../types';
import { addDataAccessRequest } from '../RequestManagerSlice';

const SavedCohortsPanel = () => {
  const openModal = (id: string) => {};

  return (
    <>
      <Stack className="w-100 m-2">
        <Group className="w-100 bg-base-light p-4">
          <SavedCohortsTable />
        </Group>
      </Stack>
    </>
  );
};
export default SavedCohortsPanel;
