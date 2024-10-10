import React, { useMemo, useState } from 'react';
import { Accordion } from '@mantine/core';
import DataSetContentsTable from './tables/DatasetContentsTable';
import { DatasetContents } from './types';
import {
  useDataLibrary,
  Datalist,
  CohortItem,
  FileItem,
  AdditionalDataItem,
  isCohortItem,
  isFileItem,
  isAdditionalDataItem,
} from '@gen3/core';
import SearchAndActions from './SearchAndActions';
import { DatasetAccordionControl } from './DatasetAccordionControl';
import { selectAllListItems } from './tables/selection';
import { useDataLibrarySelection } from './tables/SelectionContext';

interface DatalistAccordionProps {
  dataList: Datalist;
}

const DatalistAccordionItem: React.FC<DatalistAccordionProps> = ({
  dataList,
}) => {
  const { updateListInDataLibrary, deleteListFromDataLibrary } =
    useDataLibrary(false);

  const [selectedState, setSelectedState] = useState<
    'checked' | 'unchecked' | 'indeterminate'
  >('unchecked');

  const { id: listId, name: listName } = dataList;

  const { selections, updateSelections } = useDataLibrarySelection();

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

          console.log('datasetId', datasetId);
          console.log('dataItem', dataItem);

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

  const removeItemFromList = async (itemId: string) => {
    const { [itemId]: removedKey, ...newObject } = dataList.items;
    await updateListInDataLibrary(listId, {
      ...dataList,
      items: newObject,
      updatedTime: new Date().toISOString(),
    });
  };

  const handleSelectList = (checked: boolean) => {
    if (Object.keys(dataList.items).length === 0) {
      return;
    }

    if (!checked) {
      updateSelections(listId, {});
      return;
    }

    const selectAllDatasets = selectAllListItems(
      dataList, // gets the ids of all of the dataset members of list
    );
    updateSelections(listId, selectAllDatasets); // select all the datasets in the list
  };

  console.log('selections', selections);

  return (
    <Accordion.Item value={listName} key={listName}>
      <DatasetAccordionControl
        listName={listName}
        updateHandler={updateList}
        deleteListHandler={() => deleteListFromDataLibrary(listId)}
        selectListHandler={handleSelectList}
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
  const { dataLibraryItems, addListToDataLibrary } = useDataLibrary(false);

  return (
    <div className="flex flex-col w-full ml-2">
      <SearchAndActions createList={addListToDataLibrary} />
      <div className="flex items-center">
        <Accordion chevronPosition="left" classNames={{ root: 'w-full' }}>
          {dataLibraryItems &&
            Object.values(dataLibraryItems.lists).map((datalist) => {
              return (
                <DatalistAccordionItem dataList={datalist} key={datalist.id} />
              );
            })}
        </Accordion>
      </div>
    </div>
  );
};

export default DataLibraryLists;
