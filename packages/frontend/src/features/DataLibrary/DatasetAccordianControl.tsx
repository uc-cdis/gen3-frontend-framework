import {
  Accordion,
  AccordionControlProps,
  ActionIcon,
  Checkbox,
  CloseButton,
  Group,
  Text,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import { useDataLibrary } from '@gen3/core';
import { getHotkeyHandler } from '@mantine/hooks';
import {
  MdModeEditOutline as EditIcon,
  MdDelete as DeleteIcon,
} from 'react-icons/md';

export const DatasetAccordianControl = (
  props: AccordionControlProps & {
    id: string;
    listName: string;
    updateHandler: (
      listId: string,
      update: Record<string, any>,
    ) => Promise<void>;
    deleteListHandler: (listId: string) => Promise<void>;
  },
): JSX.Element => {
  const { id, listName, updateHandler, deleteListHandler } = props;
  const [value, setValue] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    updateHandler(id, { name: value });
    setValue(undefined);
  };

  return (
    <div className="flex items-center">
      <Checkbox />
      <Accordion.Control {...props} className="w-4" />
      <div className="flex justify-between w-full items-center ml-4">
        {value ? (
          <TextInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={getHotkeyHandler([['Enter', handleSubmit]])}
            rightSection={
              <CloseButton
                aria-label="Clear input"
                onClick={() => setValue(undefined)}
                style={{ display: value ? undefined : 'none' }}
              />
            }
          />
        ) : (
          <Group>
            {' '}
            <Text fw={600} className="ml-2" aria-label={listName}>
              {listName}
            </Text>{' '}
            <ActionIcon
              color="accent.4"
              aria-label="Change datalist name"
              onClick={() => setValue(listName)}
            >
              <EditIcon />
            </ActionIcon>
          </Group>
        )}
        <ActionIcon
          color="accent.4"
          aria-label="delete datalist"
          onClick={() => deleteListHandler(id)}
        >
          <DeleteIcon />
        </ActionIcon>
      </div>
    </div>
  );
};
