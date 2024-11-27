import React, { useEffect, useMemo, useState } from 'react';
import { DataItemSelectedState, DatasetContents } from './types';
import {
  AdditionalDataItem,
  CohortItem,
  Datalist,
  FileItem,
  getNumberOfItemsInDatalist,
  getTimestamp,
  isAdditionalDataItem,
  isCohortItem,
  isFileItem,
} from '@gen3/core';
import {
  getNumberOfSelectedItemsInList,
  isListInSelection,
  useDataLibrarySelection,
} from './selection/SelectionContext';
import { selectAllListItems } from './selection/selection';
import { Accordion } from '@mantine/core';
import { DatasetAccordionControl } from './DatasetAccordionControl';
import DataSetContentsTable from './tables/DatasetContentsTable';

interface DatalistAccordionProps {
  dataList: Datalist;
  updateListInDataLibrary: (id: string, data: Datalist) => Promise<void>;
  deleteListFromDataLibrary: (id: string) => Promise<void>;
}

/**
 * Renders an accordion item with data list details.
 *
 * @param {Object} dataListAccordionItemParams - Parameters for the DataListAccordionItem.
 * @param {Object} dataListAccordionItemParams.dataList - The data list to be displayed in the accordion item.
 * @param {Function} dataListAccordionItemParams.updateListInDataLibrary - Function to update the list in the data library.
 * @param {Function} dataListAccordionItemParams.deleteListFromDataLibrary - Function to delete the list from the data library.
 *
 * @return {JSX.Element} A rendered accordion item component with controls for data list updates and deletions.
 */
export const DatalistAccordionItem: React.FC<DatalistAccordionProps> = ({
  dataList,
  updateListInDataLibrary,
  deleteListFromDataLibrary,
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
    await updateListInDataLibrary(listId, {
      ...dataList,
      ...update,
      updatedTime: getTimestamp(),
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
            Object.entries(dataItem.items).forEach(([itemId, item]) => {
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
    await updateListInDataLibrary(listId, {
      ...dataList,
      items: newObject,
      updatedTime: getTimestamp(),
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
    <Accordion.Item value={listName} key={listName} className="group">
      <DatasetAccordionControl
        listName={listName}
        numberOfItems={numberOfItemsInList}
        updatedTime={dataList.updatedTime}
        createdTime={dataList.createdTime}
        updateHandler={updateList}
        deleteListHandler={() => deleteListFromDataLibrary(listId)}
        selectListHandler={handleSelectList}
        selectedState={selectedState}
      />
      <Accordion.Panel>
        <DataSetContentsTable
          listId={listId}
          data={tableRowData}
          removeList={removeItemFromList}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};
