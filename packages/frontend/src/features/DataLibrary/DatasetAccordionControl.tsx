import React, { useState } from 'react';
import {
  Accordion,
  AccordionControlProps,
  ActionIcon,
  Checkbox,
  CloseButton,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { Icon } from '@iconify/react';
import { getHotkeyHandler } from '@mantine/hooks';
import { DataItemSelectedState, IconSize } from './types';
import EmptyList from './EmptyList';
import { formatDate } from './utils';

interface DatasetAccordionControlProps extends AccordionControlProps {
  listName: string;
  numberOfItems: number;
  updatedTime: string;
  createdTime: string;
  updateHandler: (update: Record<string, any>) => Promise<void>;
  deleteListHandler: () => Promise<void>;
  selectListHandler: (checked: boolean) => void;
  selectedState: DataItemSelectedState;
  size?: string;
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
  size = 'sm',
  ...props
}: DatasetAccordionControlProps): JSX.Element => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const handleUpdateName = () => {
    updateHandler({ name: value });
    setValue(undefined);
  };
  const theme = useMantineTheme();
  const iconSize = IconSize[size] || IconSize['sm'];
  return (
    <div className="flex justify-start w-full items-center px-4 group-data-[active]:bg-secondary-lightest">
      <div className="flex items-center w-1/4">
        <Checkbox
          size={size}
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
            size={size}
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
          <div className="flex items-center justify-end">
            <Text
              fw={600}
              className="ml-2 w-100 py-2 mr-2"
              aria-label={listName}
              size={size}
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
                  height={iconSize}
                  width={iconSize}
                  color={theme.colors.accent[4]}
                />
              </ActionIcon>
            </Tooltip>
          </div>
        )}
      </div>
      <div className="flex items-center ml-auto space-x-2">
        {numberOfItems === 0 && <EmptyList />}
        <div className="flex items-center space-x-2">
          <Text fw={600} c="base-contrast.2" tt="uppercase" size={size}>
            Created:
          </Text>
          <Text fw={500} c="base-contrast.2" size={size}>
            {formatDate(createdTime)}
          </Text>

          <Icon
            icon="gen3:dot"
            height={iconSize}
            width={iconSize}
            color={theme.colors.accent[4]}
          />

          <Text fw={600} c="base-contrast.2" tt="uppercase" size={size}>
            Updated:
          </Text>
          <Text fw={500} c="base-contrast.2" size={size}>
            {formatDate(updatedTime)}
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
              height={iconSize}
              width={iconSize}
              color={theme.colors.primary[5]}
            />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
};
