import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  ScrollArea,
  Combobox,
  TextInput,
  useCombobox,
} from '@mantine/core';

import {
  extractFileDatasetsInRecords,
  useDataLibrary,
  buildListItemsGroupedByDataset,
  type DataLibrary,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { ExportActionButtonProps } from './types';

type SelectOptions = Record<string, string>;

const extractIdToLabel = (data: DataLibrary): SelectOptions =>
  !data
    ? {}
    : Object.keys(data).reduce((acc: SelectOptions, id) => {
        acc[id] = data[id].name;
        return acc;
      }, {});

const AddToDataLibrary = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  const [selectItems, setSelectItems] = useState<SelectOptions>({});
  const [currentList, setCurrentList] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, any> | null>(null);
  const [currentListName, setCurrentListName] = useState<string>('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

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
    // const items: FilesOrCohort = selectedResources.reduce(
    //   (acc: FilesOrCohort, resource: Record<string, any>) => {
    //     const dataObjects = resource[exportDataFields.dataObjectFieldName];
    //     const datasetId = resource[exportDataFields.datesetIdFieldName];
    //
    //     const datafiles = dataObjects.reduce(
    //       (dataAcc: FilesOrCohort, dataObject: any) => {
    //         const guid = dataObject[exportDataFields.dataObjectIdField];
    //         return {
    //           ...dataAcc,
    //           [guid]: {
    //             dataset_guid: datasetId,
    //             ...dataObject,
    //           },
    //         };
    //       },
    //       {} as FilesOrCohort,
    //     );
    //     return {
    //       ...acc,
    //       ...datafiles,
    //     };
    //   },
    //   {} as FilesOrCohort,
    // );

    if (listId) {
      updateListInDataLibrary({
        id: listId,
        name: listname,
        items: { ...dataLibrary[listId].items, ...items },
      });
    } else {
      addListToDataLibrary(items, listname);
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
  }, [dataLibrary, dataLibraryError]);

  return (
    <Group data-testid="add-to-data-library" wrap="nowrap">
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
      <Button
        loading={isLoading}
        classNames={{ root: 'w-1/4' }}
        disabled={
          error !== null || selectedResources.length === 0 || !currentListName
        }
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
    </Group>
  );
};

export default AddToDataLibrary;
