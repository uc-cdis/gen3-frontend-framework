import React, { useState } from 'react';
import {
  Accordion,
  AccordionControlProps,
  ActionIcon,
  Checkbox,
  CloseButton,
  Tooltip,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { Icon } from '@iconify/react';
import { getHotkeyHandler } from '@mantine/hooks';
import { DataItemSelectedState } from './types';
import EmptyList from './EmptyList';

interface DatasetAccordionControlProps extends AccordionControlProps {
  listName: string;
  numberOfItems: number;
  updatedTime: string;
  createdTime: string;
  updateHandler: (update: Record<string, any>) => Promise<void>;
  deleteListHandler: () => Promise<void>;
  selectListHandler: (checked: boolean) => void;
  selectedState: DataItemSelectedState;
}

export const DatasetAccordionControl = ({
  listName,
  numberOfItems,
  updatedTime,
  createdTime,
  updateHandler,
  deleteListHandler,
  selectListHandler,
  selectedState,
  ...props
}: DatasetAccordionControlProps): JSX.Element => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const handleUpdateName = () => {
    updateHandler({ name: value });
    setValue(undefined);
  };
  const theme = useMantineTheme();
  return (
    <div className="flex justify-start w-full items-center px-4">
      <div className="flex items-center w-1/4">
        <Checkbox
          onChange={(event) => {
            selectListHandler(event.currentTarget.checked);
            event.stopPropagation();
          }}
          checked={selectedState == 'checked'}
          indeterminate={selectedState == 'indeterminate'}
        />
        <Accordion.Control {...props} className="w-4 mr-3" />
        {value ? (
          <TextInput
            classNames={{ root: 'ml-2', input: 'font-bold' }}
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
          <span className="flex items-center justify-between">
            <Text
              fw={600}
              className="ml-2 w-100 py-2 mr-2"
              aria-label={listName}
            >
              {listName}
            </Text>
            <Tooltip label="Change name of list">
              <ActionIcon
                color="accent.4"
                variant="transparent"
                aria-label="Change datalist name"
                onClick={() => setValue(listName)}
              >
                <Icon
                  icon="gen3:edit"
                  height={24}
                  width={24}
                  color={theme.colors.primary[5]}
                />
              </ActionIcon>
            </Tooltip>
          </span>
        )}
      </div>
      <div className="flex items-end ml-auto space-x-2">
        {numberOfItems === 0 && <EmptyList />}
        <div className="flex items-center space-x-2">
          <Text fw={600} c="base-contrast.2" tt="uppercase">
            Created:
          </Text>
          <Text fw={500} c="base-contrast.2">
            {createdTime}
          </Text>

          <Icon
            icon="gen3:dot"
            height={16}
            width={16}
            color={theme.colors.primary[5]}
          />

          <Text fw={600} c="base-contrast.2" tt="uppercase">
            Updated:
          </Text>
          <Text fw={500} c="base-contrast.2">
            {updatedTime}
          </Text>
        </div>
        <Tooltip label={`Delete ${listName}. Will not delete dataset`}>
          <ActionIcon
            color="accent.4"
            variant="transparent"
            aria-label="delete list"
            onClick={() => deleteListHandler()}
          >
            <Icon
              icon="gen3:delete"
              height={24}
              width={24}
              color={theme.colors.primary[5]}
            />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
};
