import React, { useMemo, useState, useEffect } from 'react';
import { Accordion } from '@mantine/core';
import DataSetContentsTable from './tables/DatasetContentsTable';
import { DataItemSelectedState, DatasetContents } from './types';
import {
  useDataLibrary,
  Datalist,
  CohortItem,
  FileItem,
  AdditionalDataItem,
  isCohortItem,
  isFileItem,
  isAdditionalDataItem,
  getNumberOfItemsInDatalist,
} from '@gen3/core';
import SearchAndActions from './SearchAndActions';
import { DatasetAccordionControl } from './DatasetAccordionControl';
import { selectAllListItems } from './tables/selection';
import {
  getNumberOfSelectedItemsInList,
  isListInSelection,
  useDataLibrarySelection,
} from './tables/SelectionContext';

interface DatalistAccordionProps {
  dataList: Datalist;
  updateListInDataLibrary: (id: string, data: Datalist) => Promise<void>;
  deleteListFromDataLibrary: (id: string) => Promise<void>;
}

const DatalistAccordionItem: React.FC<DatalistAccordionProps> = ({
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

  const {
    selections,
    updateSelections,
    updateListMemberSelections,
    removeList,
  } = useDataLibrarySelection();

  const updateList = async (update: Record<string, any>) => {
    await updateListInDataLibrary(listId, {
      ...dataList,
      ...update,
      updatedTime: new Date().toISOString(),
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

          // for each dataset in the List

          if (isCohortItem(dataItem)) {
            queries.push({
              ...(dataItem as CohortItem),
              description: '',
              //  id: datasetId,
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

    if (numberOfSelectedItemsInList == numberOfItemsInList) {
      setSelectedState('checked');
      return;
    }

    if (numberOfSelectedItemsInList === 0) {
      // list is not in selections
      setSelectedState('unchecked');
      return;
    }

    if (numberOfSelectedItemsInList < numberOfItemsInList)
      setSelectedState('indeterminate');
  }, [listId, numberOfItemsInList, selections]);

  const removeItemFromList = async (itemId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [itemId]: _removedKey, ...newObject } = dataList.items;
    await updateListInDataLibrary(listId, {
      ...dataList,
      items: newObject,
      updatedTime: new Date().toISOString(),
    });
    // update selections
    updateListMemberSelections(listId, itemId, {});
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
    <Accordion.Item value={listName} key={listName}>
      <DatasetAccordionControl
        listName={listName}
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

const DataLibraryLists = () => {
  const {
    dataLibraryItems,
    addListToDataLibrary,
    updateListInDataLibrary,
    deleteListFromDataLibrary,
  } = useDataLibrary(false);

  return (
    <div className="flex flex-col w-full ml-2">
      <SearchAndActions createList={addListToDataLibrary} />
      <div className="flex items-center">
        <Accordion chevronPosition="left" classNames={{ root: 'w-full' }}>
          {dataLibraryItems &&
            Object.values(dataLibraryItems.lists).map((datalist) => {
              return (
                <DatalistAccordionItem
                  dataList={datalist}
                  key={datalist.id}
                  updateListInDataLibrary={updateListInDataLibrary}
                  deleteListFromDataLibrary={deleteListFromDataLibrary}
                />
              );
            })}
        </Accordion>
      </div>
    </div>
  );
};

export default DataLibraryLists;
