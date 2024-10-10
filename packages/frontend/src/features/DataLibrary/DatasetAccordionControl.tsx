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
import { getHotkeyHandler } from '@mantine/hooks';
import {
  MdModeEditOutline as EditIcon,
  MdDelete as DeleteIcon,
} from 'react-icons/md';

interface DatasetAccordionControlProps extends AccordionControlProps {
  listName: string;
  updateHandler: (update: Record<string, any>) => Promise<void>;
  deleteListHandler: () => Promise<void>;
  selectListHandler: (checked: boolean) => void;
}

export const DatasetAccordionControl = (
  props: DatasetAccordionControlProps,
): JSX.Element => {
  const { listName, updateHandler, deleteListHandler, selectListHandler } =
    props;
  const [value, setValue] = useState<string | undefined>(undefined);

  const handleUpdateName = () => {
    updateHandler({ name: value });
    setValue(undefined);
  };

  return (
    <div className="flex items-center">
      <Checkbox
        onChange={(event) => {
          selectListHandler(event.currentTarget.checked);
        }}
      />
      <Accordion.Control {...props} className="w-4" />
      <div className="flex justify-between w-full items-center ml-4">
        {value ? (
          <TextInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={getHotkeyHandler([['Enter', handleUpdateName]])}
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
          onClick={() => deleteListHandler()}
        >
          <DeleteIcon />
        </ActionIcon>
      </div>
    </div>
  );
};
