import React, { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  ComboboxItem,
  ModalProps,
  Stack,
  Select,
  Text,
} from '@mantine/core';

import SelectedItemsTable from '../tables/SelectedItemsTable';

type SelectedItemsModelProps = ModalProps;

// TODO replace with selection handlers

const Destinations = [
  { label: 'Manifest', value: 'manifest' },
  { label: 'ZIP File', value: 'zipfile' },
  { label: 'Workspace', value: 'workspace' },
];

const SelectedItemsModal: React.FC<SelectedItemsModelProps> = (props) => {
  const [value, setValue] = useState<ComboboxItem | null>(null);

  return (
    <Modal {...props} title="Retrieve Data" closeOnEscape centered>
      <Stack>
        <SelectedItemsTable />
        <Group justify="space-between">
          <Group>
            <Text fw={600}>Destination:</Text>
            <Select
              data={Destinations}
              value={value ? value.value : null}
              onChange={(_value, option) => setValue(option)}
            />
          </Group>
          <Button onClick={() => console.log('send')}>Send</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SelectedItemsModal;
