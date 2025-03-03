import React, { useState } from 'react';
import {
  Button,
  ComboboxItem,
  Group,
  Select,
  Combobox,
  InputBase,
  useCombobox,
} from '@mantine/core';

import { useDataLibrary } from '@gen3/core';
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
    isError,
    error: dataLibraryError,
  } = useDataLibrary(isAuthenticated);

  const saveToList = (
    listname: string,
    listId: string | undefined = undefined,
  ) => {
    if (selectedResources.length === 0) return;
    const items = selectedResources.reduce(
      (acc: Record<string, any>, resource: Record<string, any>) => {
        const dataObjects = resource[exportDataFields.dataObjectFieldName];
        const datasetId = resource[exportDataFields.datesetIdFieldName];

        const datafiles = dataObjects.reduce(
          (dataAcc: Record<string, any>, dataObject: any) => {
            const guid = dataObject[exportDataFields.dataObjectIdField];
            return {
              ...dataAcc,
              [guid]: {
                dataset_guid: datasetId,
                ...dataObject,
              },
            };
          },
          {},
        );
        return {
          ...acc,
          ...datafiles,
        };
      },
      {},
    );

    if (listId) {
      updateListInDataLibrary(listId, { ...dataLibrary[listId], items });
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
    if (dataLibrary && !isError) {
      const listItems = extractListNameAndId(dataLibrary.lists);
      setData(listItems);
    }
    if (isError) {
      setError(dataLibraryError);
    }
  }, [dataLibrary, isError]);

  // fetch the list

  const notLoggedIn = false;

  return (
    <React.Fragment>
      <Group data-testid="add-to-data-library">
        <Combobox
          store={combobox}
          withinPortal={false}
          onOptionSubmit={(val) => {
            if (val === '$create') {
              setData((current) => [...current, search]);
              setValue(search);
            } else {
              setValue(val);
              setSearch(val);
            }

            combobox.closeDropdown();
          }}
        >
          <Combobox.Target>
            <InputBase
              rightSection={<Combobox.Chevron />}
              value={search}
              onChange={(event) => {
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
                setSearch(event.currentTarget.value);
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => {
                combobox.closeDropdown();
                setSearch(value || '');
              }}
              placeholder="Search value"
              rightSectionPointerEvents="none"
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              {options}
              {!exactOptionMatch && search.trim().length > 0 && (
                <Combobox.Option value="$create">
                  + Create {search}
                </Combobox.Option>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
        <Button
          loading={loading}
          disabled={
            error !== null ||
            loading ||
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
