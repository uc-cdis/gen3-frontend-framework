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
  getActionById,
  doesItemFailRule,
  doesGroupFailRule,
} from '../selection/selectedItemActions';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useDataLibrarySelection } from '../selection/SelectionContext';
import { MRT_RowSelectionState } from 'mantine-react-table';
import { ValidatedSelectedItem } from '../types';
import { ActionsConfig } from '../selection/types';

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

  const validatedLibrarySelections =
    useDeepCompareMemo((): ReadonlyArray<ValidatedSelectedItem> => {
      // get the action
      const action = getActionById(actions, value?.value);
      // if there are no actions then everything is valid
      if (!action)
        return gatheredItems.map((item) => {
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
          const itemFailsRule = doesItemFailRule(item, action);

          const itemAndGroupTestMessages = [
            ...itemFailsRule,
            ...groupFailsRule,
          ];
          if (itemAndGroupTestMessages.length > 0)
            return {
              ...item,
              valid: false,
              errorMessages: itemAndGroupTestMessages,
            };

          // defaults return true
          return { ...item, valid: true };
        } // no selection so all items are valid
        else return { ...item, valid: true };
      });

      return validItems;
    }, [gatheredItems, rowSelection, actions, value]);

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
          <Button
            disabled={
              !value || validatedLibrarySelections.some((x) => !x.valid)
            }
            onClick={() => console.log('send')}
          >
            Send
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SelectedItemsModal;
