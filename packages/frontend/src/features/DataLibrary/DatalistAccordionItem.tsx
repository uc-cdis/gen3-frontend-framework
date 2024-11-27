import React, { useEffect, useMemo, useState } from 'react';
import { DataItemSelectedState, DatalistContents } from './types';
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
import DatalistContentsPanel from './tables/DatalistContentsPanel';

interface DatalistAccordionProps {
  dataList: Datalist;
  updateListInDataLibrary: (id: string, data: Datalist) => Promise<void>;
  deleteListFromDataLibrary: (id: string) => Promise<void>;
}

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

  const tableRowData = useMemo(() => {
    const [queries, files, additionalData] = [
      [] as CohortItem[],
      [] as FileItem[],
      [] as AdditionalDataItem[],
    ];

    Object.keys(dataList.items).forEach((key) => {
      // for each dataset in the List
      const dataItem = dataList.items[key];
      if (isCohortItem(dataItem)) {
        queries.push(dataItem);
      } else if (isFileItem(dataItem)) {
        files.push(dataItem);
      } else if (isAdditionalDataItem(dataItem)) {
        additionalData.push(dataItem);
      } else {
        console.warn('DataLibrary: unknown item', dataItem);
      }
    });

    return {
      id: dataList.id,
      name: dataList.name,
      queries: queries,
      files: files,
      additionalData: additionalData,
    };
  }, [dataList]);

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
        <DatalistContentsPanel
          listId={listId}
          contents={tableRowData}
          removeList={removeItemFromList}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};
