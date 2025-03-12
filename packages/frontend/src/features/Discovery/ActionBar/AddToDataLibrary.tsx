import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  ComboboxItem,
  Group,
  ScrollArea,
  Combobox,
  TextInput,
  useCombobox,
  useMantineTheme,
} from '@mantine/core';

import { Icon } from '@iconify/react';

import { FilesOrCohort, useDataLibrary } from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useIsAuthenticated } from '../../../lib/session/session';
import { ExportActionButtonProps } from './types';

const extractListNameAndId = (data: any): ComboboxItem[] =>
  !data
    ? []
    : Object.keys(data).map((id) => ({ value: id, label: data[id].name }));

const DiscoveryDataLibrary = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  const [data, setData] = useState<ComboboxItem[]>([]);
  const [currentList, setCurrentList] = useState<ComboboxItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Record<string, any> | null>(null);
  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { isAuthenticated } = useIsAuthenticated();
  const {
    dataLibrary,
    updateListInDataLibrary,
    addListToDataLibrary,
    isLoading,
    error: dataLibraryError,
  } = useDataLibrary();

  const theme = useMantineTheme();

  const saveToList = (
    listname: string,
    listId: string | undefined = undefined,
  ) => {
    if (selectedResources.length === 0) return;
    const items: FilesOrCohort = selectedResources.reduce(
      (acc: FilesOrCohort, resource: Record<string, any>) => {
        const dataObjects = resource[exportDataFields.dataObjectFieldName];
        const datasetId = resource[exportDataFields.datesetIdFieldName];

        const datafiles = dataObjects.reduce(
          (dataAcc: FilesOrCohort, dataObject: any) => {
            const guid = dataObject[exportDataFields.dataObjectIdField];
            return {
              ...dataAcc,
              [guid]: {
                dataset_guid: datasetId,
                ...dataObject,
              },
            };
          },
          {} as FilesOrCohort,
        );
        return {
          ...acc,
          ...datafiles,
        };
      },
      {} as FilesOrCohort,
    );

    if (listId) {
      updateListInDataLibrary({
        id: listId,
        name: listname,
        items: { ...dataLibrary[listId].items, ...items },
      });
    } else {
      addListToDataLibrary(items);
    }
  };

  const exactOptionMatch = data.some((item) => item.label === search);
  const filteredOptions = exactOptionMatch
    ? data
    : data.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase().trim()),
      );

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      {item.label}
    </Combobox.Option>
  ));

  useDeepCompareEffect(() => {
    if (dataLibrary && !dataLibraryError) {
      const listItems = extractListNameAndId(dataLibrary.lists);
      setData(listItems);
    }
    setError(dataLibraryError);
  }, [dataLibrary, dataLibraryError]);

  // fetch the list

  const notLoggedIn = false;

  return (
    <React.Fragment>
      <Group data-testid="add-to-data-library">
        <Combobox
          onOptionSubmit={(optionValue) => {
            setValue(optionValue);
            combobox.closeDropdown();
          }}
          store={combobox}
          withinPortal={false}
        >
          <Combobox.Target>
            <TextInput
              placeholder="Pick value or type anything"
              value={value ?? ''}
              onChange={(event) => {
                setValue(event.currentTarget.value);
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              <ScrollArea.Autosize mah={200} type="scroll">
                {options.length === 0 ? (
                  <Combobox.Empty>Nothing found</Combobox.Empty>
                ) : (
                  options
                )}
              </ScrollArea.Autosize>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
        <ActionIcon color={theme.colors.base[0]}>
          <Icon
            icon="gen3:plus"
            height={32}
            width={32}
            color={theme.colors.accent[5]}
          />
        </ActionIcon>
        <Button
          loading={loading}
          disabled={
            error !== null ||
            data?.length === 0 ||
            currentList === undefined ||
            selectedResources.length === 0 ||
            notLoggedIn
          }
          onClick={() => {
            if (currentList) {
              saveToList(currentList.label, currentList.value);
            } else {
              saveToList('New List');
            }
          }}
        >
          {buttonConfig?.label ?? 'Save to List'}
        </Button>
      </Group>
    </React.Fragment>
  );
};

export default DiscoveryDataLibrary;
