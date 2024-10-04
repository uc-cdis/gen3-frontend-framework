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
import { useDeepCompareMemo } from 'use-deep-compare';
import DataLibraryLists from './DataLibraryLists';

const DataLibraryPanel = () => {
  const { dataLibraryItems, clearLibrary, setAllListsInDataLibrary } =
    useDataLibrary(false);

  const dataLists = useDeepCompareMemo(() => {
    const savedLists = Object.entries(dataLibraryItems?.lists ?? {}).map(
      // for each List
      ([listId, dataList]) => {
        const listMembers = Object.entries(dataList.items).map(
          ([datasetId, dataItem]) => {
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
              });
            } else {
              // handle RegisteredDataListEntry
              Object.values(dataItem.items).forEach((item) => {
                if (isFileItem(item)) {
                  files.push(item);
                } else if (isAdditionalDataItem(item)) {
                  additionalData.push(item);
                } else {
                  console.warn('DataLibrary: unknown item', item);
                }
              });
            }
            // return the
            return {
              id: datasetId,
              name: dataItem.name,
              queries: queries,
              files: files,
              additionalData: additionalData,
            };
          },
        );
        return {
          id: listId,
          name: dataList.name,
          datasetItems: listMembers,
        };
      },
    );
    return savedLists;
  }, [dataLibraryItems?.lists]);

  return (
    <div className="flex flex-col w-full ml-2">
      <DataLibraryLists dataLists={dataLists} />
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
