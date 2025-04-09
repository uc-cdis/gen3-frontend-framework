import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  ScrollArea,
  Combobox,
  TextInput,
  useCombobox,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

import {
  extractFileDatasetsInRecords,
  useDataLibrary,
  buildListItemsGroupedByDataset,
  type DataLibrary,
  useCoreSelector,
  type CoreState,
  selectUserAuthStatus,
  isAuthenticated,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { ExportActionButtonProps } from './types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';

type SelectOptions = Record<string, string>;

const extractIdToLabel = (data: DataLibrary): SelectOptions =>
  !data
    ? {}
    : Object.keys(data).reduce((acc: SelectOptions, id) => {
        acc[id] = data[id].name;
        return acc;
      }, {});

const createTooltipLabel = (
  error: Record<string, any> | null,
  isLoggedIn: boolean,
  requiresLogin: boolean | undefined,
  numSelected: number,
  currentListName: string | undefined,
) => {
  if (error) return 'Error saving to data library. Please try again later';
  if (!isLoggedIn && requiresLogin)
    return 'Please log in to save to data library';
  if (numSelected === 0)
    return 'Please select at least one study to save to data library';
  if (!currentListName) return 'Please select or create a list';

  return 'Add selections to list';
};

const AddToDataLibrary = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
  classNames = {},
}: ExportActionButtonProps) => {
  const [selectItems, setSelectItems] = useState<SelectOptions>({});
  const [currentList, setCurrentList] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, any> | null>(null);
  const [currentListName, setCurrentListName] = useState<string>('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );

  const isLoggedIn = isAuthenticated(userStatus);
  const isDisabled =
    error !== null ||
    selectedResources.length === 0 ||
    !currentListName ||
    (buttonConfig?.requiresLogin && !isLoggedIn);
  const tooltipLabel = createTooltipLabel(
    error,
    isLoggedIn,
    buttonConfig.requiresLogin,
    selectedResources.length,
    currentListName,
  );
  const classNamesDefaults = {
    root: 'w-1/2',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  const {
    dataLibrary,
    updateListInDataLibrary,
    addListToDataLibrary,
    isLoading,
    error: dataLibraryError,
  } = useDataLibrary();

  const saveToList = (
    listname: string,
    listId: string | undefined = undefined,
  ) => {
    if (selectedResources.length === 0) return;
    const items = buildListItemsGroupedByDataset(
      extractFileDatasetsInRecords(selectedResources, exportDataFields),
    );

    if (listId) {
      if (Object.keys(items).length === 0) {
        notifications.show({
          id: 'update-datalibrary-no-items-to-update-notification',
          position: 'top-center',
          withCloseButton: true,
          autoClose: 5000,
          title: 'Save to list',
          message: `No data objects selected to save to list ${listname}.`,
          loading: false,
        });
        return;
      }
      updateListInDataLibrary({
        id: listId,
        name: listname,
        items: { ...dataLibrary[listId].items, ...items },
      });

      notifications.show({
        id: 'update-datalibrary-list-notification',
        position: 'top-center',
        withCloseButton: true,
        autoClose: 5000,
        title: 'Save to list',
        message: `${Object.values(items)} saved to list ${listname} successfully.`,
        loading: isLoading,
      });
    } else {
      addListToDataLibrary(items, listname);
      notifications.show({
        id: 'update-datalibrary-list-notification',
        position: 'top-center',
        withCloseButton: true,
        autoClose: 5000,
        title: 'Save to list',
        message: `${Object.values(items)} saved to list ${listname} successfully.`,
        loading: isLoading,
      });
    }
  };

  const exactOptionMatch = Object.values(selectItems).some(
    (listName) => listName === currentListName,
  );
  const filteredOptions = exactOptionMatch
    ? selectItems
    : Object.entries(selectItems).reduce((acc, [listId, listName]) => {
        if (
          listName.toLowerCase().includes(currentListName.toLowerCase().trim())
        ) {
          acc[listId] = listName;
        }
        return acc;
      }, {} as SelectOptions);

  const options = useMemo(
    () =>
      Object.entries(filteredOptions).map(([listId, listName]) => (
        <Combobox.Option value={listId} key={listId}>
          {listName}
        </Combobox.Option>
      )),
    [filteredOptions],
  );

  useEffect(() => {
    if (options.length === 0) setCurrentList(null);
  }, [options]);

  useDeepCompareEffect(() => {
    if (dataLibrary && !dataLibraryError) {
      const listItems = extractIdToLabel(dataLibrary);
      setSelectItems(listItems);
    }
    setError(dataLibraryError);
    if (dataLibraryError) {
      notifications.show({
        id: 'update-datalibrary-error-notification',
        position: 'top-center',
        withCloseButton: true,
        autoClose: 5000,
        title: 'Error',
        message: `Error saving to data library. Please try again later.`,
        loading: false,
      });
    }
  }, [dataLibrary, dataLibraryError]);

  return (
    <Group
      data-testid="add-to-data-library"
      wrap="nowrap"
      classNames={{ root: mergedClassnames.root }}
    >
      <Combobox
        onOptionSubmit={(selectedValue) => {
          setCurrentList(selectedValue);
          setCurrentListName(selectItems[selectedValue]);
          combobox.closeDropdown();
        }}
        store={combobox}
        withinPortal={false}
      >
        <Combobox.Target>
          <TextInput
            placeholder="Select/Search/Create List"
            value={currentListName ?? ''}
            className={'w-full'}
            onChange={(event) => {
              setCurrentListName(event.currentTarget.value);
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
                <Combobox.Empty>Click button to create new list</Combobox.Empty>
              ) : (
                options
              )}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      <Tooltip label={tooltipLabel}>
        <Button
          classNames={{ root: 'w-1/3' }}
          loading={isLoading}
          disabled={isDisabled}
          onClick={() => {
            if (currentList) {
              saveToList(selectItems[currentList], currentList);
            } else {
              saveToList(currentListName, undefined);
            }
          }}
        >
          {options.length === 0 && currentListName.length > 0
            ? 'Save to New List'
            : (buttonConfig?.label ?? 'Save to List')}
        </Button>
      </Tooltip>
    </Group>
  );
};

export default AddToDataLibrary;
