import React, { useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAppSelector, useAppDispatch, AppState } from '../appApi';
import { selectCurrentCohortFilters } from '../SavedCohortManagerSlice';
import { saveCohort } from '../SavedCohortManagerSlice';
import { IndexedFilterSet } from '@gen3/core';
import { ActionButtonProps } from '../types';

const SaveActionButton: React.FC<ActionButtonProps> = ({ index }) => {
  const [opened, { close, open }] = useDisclosure(false);
  const filters: IndexedFilterSet = useAppSelector((state: AppState) =>
    selectCurrentCohortFilters(state),
  );

  const [cohortName, setCohortName] = useState('New Cohort');

  const appDispatch = useAppDispatch();
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        radius="md"
        title="Save Cohort"
        classNames={{
          header: 'p-1 px-4 border-base-lighter border-b-1 uppercase font-bold',
        }}
      >
        <Stack className="mt-2">
          <TextInput
            description="Enter name to save cohort"
            label="Cohort Name"
            placeholder="New Cohort"
            data-autofocus
            onChange={(event) => {
              setCohortName(event.currentTarget.value);
            }}
            value={cohortName}
            required
          />
          <Group justify="flex-end" className="bg-base-lighter -m-4 p-3 mt-3">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                appDispatch(saveCohort({ name: cohortName, filters: filters }));
                close();
              }}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Button
        size="sm"
        variant="outline"
        color="secondary.4"
        disabled={
          !(index in filters) || Object.keys(filters[index].root).length == 0
        }
        classNames={{
          root: 'bg-base-max',
        }}
        onClick={open}
      >
        Save Cohort
      </Button>
    </>
  );
};

export default SaveActionButton;
