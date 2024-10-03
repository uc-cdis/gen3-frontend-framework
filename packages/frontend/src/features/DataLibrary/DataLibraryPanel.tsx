import { Accordion, Button, Checkbox } from '@mantine/core';
import { useState } from 'react';
import ListsTable from './tables/ListsTable';
import { DataLibraryList } from './types';
import {
  AdditionalDataItem,
  CohortItem,
  FileItem,
  isAdditionalDataItem,
  isCohortItem,
  isFileItem,
  useDataLibrary,
} from '@gen3/core';
import { data1 } from './utils';
import SearchAndActions from './SearchAndActions';
import { DatasetAccordianControl } from './DatasetAccordianControl';
import { useDeepCompareEffect } from 'use-deep-compare';

const DataLibraryPanel = () => {
  const [currentLists, setCurrentLists] = useState<Array<DataLibraryList>>([]);

  const {
    dataLibraryItems,
    setAllListsInDataLibrary,
    clearLibrary,
    updateListInDataLibrary,
    deleteListFromDataLibrary,
  } = useDataLibrary(false);

  const updateList = async (listId: string, update: Record<string, any>) => {
    if (!dataLibraryItems) return;
    console.log('updateList from list', listId);
    await updateListInDataLibrary(listId, {
      ...dataLibraryItems.lists[listId],
      ...update,
      updatedTime: new Date().toISOString(),
    });
  };

  const removeItemFromList = async (listId: string, itemId: string) => {
    if (!dataLibraryItems) return;

    console.log('remove from list', listId, itemId);
    const { [itemId]: removedKey, ...newObject } =
      dataLibraryItems.lists[listId].items;
    await updateListInDataLibrary(listId, {
      ...dataLibraryItems.lists[listId],
      items: newObject,
      updatedTime: new Date().toISOString(),
    });
  };

  useDeepCompareEffect(() => {
    console.log('DataLibraryPanel: dataLibraryItems', dataLibraryItems);
    const savedLists = Object.entries(dataLibraryItems?.lists ?? {}).map(
      // for each List
      ([listId, dataList]) => {
        const listMembers = Object.keys(dataList.items).map((key) => {
          const [queries, files, additionalData] = [
            [] as CohortItem[],
            [] as FileItem[],
            [] as AdditionalDataItem[],
          ];

          // for each dataset in the List
          const dataItem = dataList.items[key];

          if (isCohortItem(dataItem)) {
            queries.push({
              ...(dataItem as CohortItem),
              description: '',
              data: dataItem.items as string,
              name: key,
            });
          } else {
            // handle RegisteredDataListEntry
            Object.entries(dataItem.items).forEach(([id, item]) => {
              if (isFileItem(item)) {
                files.push(item);
              } else if (isAdditionalDataItem(item)) {
                additionalData.push(item);
              } else {
                console.warn('DataLibrary: unknown item', item);
              }
            });
          }
          return {
            id: dataList.id,
            name: key,
            queries: queries,
            files: files,
            additionalData: additionalData,
          };
        });
        return {
          id: listId,
          name: dataList.name,
          datasetItems: listMembers,
        };
      },
    );
    setCurrentLists(savedLists);
  }, [dataLibraryItems?.lists]);

  return (
    <div className="flex flex-col w-full ml-2">
      <SearchAndActions />
      <div className="flex flex-col">
        {currentLists.map(({ id, name, datasetItems }) => {
          return (
            <div className="flex items-center" key={id}>
              <Accordion chevronPosition="left" classNames={{ root: 'w-full' }}>
                <Accordion.Item value={name} key={name}>
                  <DatasetAccordianControl
                    id={id}
                    listName={name}
                    updateHandler={updateList}
                    deleteListHandler={deleteListFromDataLibrary}
                  />
                  <Accordion.Panel>
                    <ListsTable
                      listId={id}
                      data={datasetItems}
                      removeList={removeItemFromList}
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
          );
        })}
      </div>
      <div className="flex space-x-4 m-2">
        <Button
          onClick={() => {
            setAllListsInDataLibrary(data1 as any);
          }}
        >
          Load Sample List
        </Button>
        <Button
          onClick={() => {
            clearLibrary();
          }}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default DataLibraryPanel;
