import React, { useState } from 'react';
import { Group, Modal, Stack } from '@mantine/core';
import SavedCohortsTable from './SavedCohortsTable';
import DataAccessRequestForm from '../Requests/DataAccessRequestForm';
import { useDisclosure } from '@mantine/hooks';

const SavedCohortsPanel = () => {
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [opened, { close, open }] = useDisclosure(false);
  const openModal = (id: string) => {
    setCohortId(id);
    open();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          close();
        }}
        radius="md"
        size="auto"
        title="Request Access to Cohort"
        classNames={{
          header: 'p-1 px-4 border-base-lighter border-b-1 uppercase font-bold',
        }}
      >
        {cohortId && (
          <DataAccessRequestForm
            cohortId={cohortId}
            close={() => {
              close();
            }}
          />
        )}
      </Modal>
      <Stack className="w-100 m-2">
        <Group className="w-100 bg-base-light p-4">
          <SavedCohortsTable openModal={openModal} />
        </Group>
      </Stack>
    </>
  );
};
export default SavedCohortsPanel;
