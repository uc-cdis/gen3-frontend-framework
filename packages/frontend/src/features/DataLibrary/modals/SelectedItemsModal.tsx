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
  getActionById,
  doesItemFailRule,
  doesGroupFailRule,
} from '../selection/selectedItemActions';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useDataLibrarySelection } from '../selection/SelectionContext';

interface SelectedItemsModelProps extends ModalProps {
  actions: ActionsConfig;
}

const SelectedItemsModal: React.FC<SelectedItemsModelProps> = (props) => {
  const [value, setValue] = useState<ComboboxItem | null>(null);
  const { actions } = props;
  const { gatheredItems } = useDataLibrarySelection();
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const destinations = useMemo(() => {
    return actions.map((action) => {
      return { label: action.label, value: action.id };
    });
  }, [actions]);

  const validatedLibrarySelections = useDeepCompareMemo(() => {
    // get the action
    const action = getActionById(actions, value?.value);
    // if there are no actions then everything is valie
    if (!action)
      return gatheredItems.map((item, index) => {
        return { ...item, valid: true };
      });
    // get all selected items
    const selectedActionItems = gatheredItems.filter((_, index) =>
      Object.hasOwn(rowSelection, index),
    );
    // apply group rules of action if any fail then add error message and set flag
    const groupFailsRule = doesGroupFailRule(selectedActionItems, action);
    const validItems = gatheredItems.map((item, index) => {
      if (rowSelection[index]) {
        // if selected then validate item rules
        if (doesItemFailRule(item, action)) {
          return { ...item, valid: false };
        }
        // if group has failed set this item to invalid
        if (groupFailsRule) return { ...item, valid: false };
        // defaults return true
        return { ...item, valid: true };
      } // no selection so all items are valid
      else return { ...item, valid: true };
    });

    return validItems;
  }, [gatheredItems, rowSelection, actions]);

  return (
    <Modal {...props} title="Retrieve Data" closeOnEscape centered>
      <Stack>
        <SelectedItemsTable
          validatedItems={validatedLibrarySelections}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
        <Group justify="space-between">
          <Group>
            <Text fw={600}>Destination:</Text>
            <Select
              data={destinations}
              value={value ? value.value : null}
              onChange={(_value, option) => {
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
