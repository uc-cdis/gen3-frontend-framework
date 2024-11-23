import React, { useMemo, useState } from 'react';
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
import {
  ActionsConfig,
  getFailedActionsForItems,
} from '../selection/selectedItemActions';
import { useDeepCompareCallback } from 'use-deep-compare';
import { useDataLibrarySelection } from '../selection/SelectionContext';

interface SelectedItemsModelProps extends ModalProps {
  actions: ActionsConfig;
}

const SelectedItemsModal: React.FC<SelectedItemsModelProps> = (props) => {
  const [value, setValue] = useState<ComboboxItem | null>(null);
  const { actions } = props;
  const { gatheredItems } = useDataLibrarySelection();

  const destinations = useMemo(() => {
    return actions.map((action) => {
      return { label: action.label, value: action.id };
    });
  }, [actions]);

  const validateSelections = useDeepCompareCallback(() => {
    const failedItems = getFailedActionsForItems(actions, gatheredItems);

    console.log(failedItems);
  }, [actions, gatheredItems]);

  return (
    <Modal {...props} title="Retrieve Data" closeOnEscape centered>
      <Stack>
        <SelectedItemsTable />
        <Group justify="space-between">
          <Group>
            <Text fw={600}>Destination:</Text>
            <Select
              data={destinations}
              value={value ? value.value : null}
              onChange={(_value, option) => {
                validateSelections();
                setValue(option);
              }}
            />
          </Group>
          <Button onClick={() => console.log('send')}>Send</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SelectedItemsModal;
