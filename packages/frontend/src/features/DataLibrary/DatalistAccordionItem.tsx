import React, { useEffect, useMemo, useState } from 'react';
import { DataItemSelectedState, DatasetContents } from './types';
import {
  AdditionalDataItem,
  CohortItem,
  Datalist,
  FileItem,
  getNumberOfItemsInDatalist,
  isAdditionalDataItem,
  isCohortItem,
  isFileItem,
  DataListUpdate,
  StorageOperationResults,
} from '@gen3/core';
import {
  getNumberOfSelectedItemsInList,
  isListInSelection,
  useDataLibrarySelection,
} from './selection/SelectionContext';
import { selectAllListItems } from './selection/selection';
import { Accordion, LoadingOverlay } from '@mantine/core';
import { DatasetAccordionControl } from './DatasetAccordionControl';
import DataSetContentsTable from './tables/DatasetContentsTable';

interface DatalistAccordionProps {
  dataList: Datalist;
  updateListInDataLibrary: (
    payload: DataListUpdate,
  ) => Promise<StorageOperationResults>;
  deleteListFromDataLibrary: (id: string) => Promise<StorageOperationResults>;
  isUpdating: string | null;
  size?: string;
}

/**
 * Renders an accordion item with data list details.
 *
 * @param {Object} dataListAccordionItemParams - Parameters for the DataListAccordionItem.
 * @param {Object} dataListAccordionItemParams.dataList - The data list to be displayed in the accordion item.
 *
 * @return {JSX.Element} A rendered accordion item component with controls for data list updates and deletions.
 */
export const DatalistAccordionItem: React.FC<DatalistAccordionProps> = ({
  dataList,
  updateListInDataLibrary,
  deleteListFromDataLibrary,
  isUpdating,
  size = 'sm',
}) => {
  const [selectedState, setSelectedState] =
    useState<DataItemSelectedState>('unchecked');

  const { id: listId, name: listName } = dataList;
  const numberOfItemsInList = useMemo(() => {
    return getNumberOfItemsInDatalist(dataList);
  }, [dataList]);

  const { selections, updateSelections, removeListMember, removeList } =
    useDataLibrarySelection();

  const updateList = async (update: Record<string, any>) => {
    return await updateListInDataLibrary({
      ...{ name: listName, items: dataList.items },
      ...update,
      id: listId,
    });
  };

  const tableRowData = useMemo(
    () =>
      Object.entries(dataList.items).reduce(
        (acc: Record<string, DatasetContents>, [datasetId, dataItem]) => {
          const [queries, files, additionalData] = [
            [] as CohortItem[],
            [] as FileItem[],
            [] as AdditionalDataItem[],
          ];

          if (isCohortItem(dataItem)) {
            queries.push({
              ...(dataItem as CohortItem),
              description: '',
              index: dataItem.index,
              id: datasetId,
            });
          } else {
            // handle RegisteredDataListEntry
            Object.entries(dataItem.members).forEach(([itemId, item]) => {
              if (isFileItem(item)) {
                files.push({
                  ...item,
                  id: itemId,
                });
              } else if (isAdditionalDataItem(item)) {
                additionalData.push(item);
              } else {
                console.warn('DataLibrary: unknown item', item);
              }
            });
          }
          // return the
          acc[datasetId] = {
            id: datasetId,
            name: dataItem.name,
            queries: queries,
            files: files,
            additionalData: additionalData,
          };
          return acc;
        },
        {},
      ),
    [dataList],
  );

  useEffect(() => {
    // list is not in selection
    if (!isListInSelection(listId, selections)) {
      setSelectedState('unchecked');
      return;
    }

    const numberOfSelectedItemsInList = getNumberOfSelectedItemsInList(
      selections,
      listId,
    );

    // everything in the list is selected
    if (numberOfSelectedItemsInList == numberOfItemsInList) {
      setSelectedState('checked');
      return;
    }

    // list is not in selections
    if (numberOfSelectedItemsInList === 0) {
      setSelectedState('unchecked');
      return;
    }

    // some checked items
    if (numberOfSelectedItemsInList < numberOfItemsInList)
      setSelectedState('indeterminate');
  }, [listId, numberOfItemsInList, selections]);

  const removeItemFromList = async (itemId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [itemId]: _removedKey, ...newObject } = dataList.items;
    await updateListInDataLibrary({
      id: listId,
      name: dataList.name,
      items: newObject,
    });
    // update selections
    removeListMember(listId, itemId);
  };

  const handleSelectList = (checked: boolean) => {
    if (!checked) {
      removeList(listId);
      return;
    }

    const selectAllDatasets = selectAllListItems(
      dataList, // gets the ids of all the dataset members of list
    );
    updateSelections(listId, selectAllDatasets); // select all the datasets in the list
  };

  return (
    <Accordion.Item
      value={listName}
      key={listName}
      className="group"
      pos="relative"
    >
      <LoadingOverlay visible={isUpdating === listId} />
      <DatasetAccordionControl
        listName={listName}
        numberOfItems={numberOfItemsInList}
        updatedTime={dataList.updated_time}
        createdTime={dataList.created_time}
        updateHandler={updateList}
        deleteListHandler={() => deleteListFromDataLibrary(listId)}
        selectListHandler={handleSelectList}
        selectedState={selectedState}
        size={size}
      />
      <Accordion.Panel>
        <DataSetContentsTable
          listId={listId}
          data={tableRowData}
          removeList={removeItemFromList}
          size={size}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};
