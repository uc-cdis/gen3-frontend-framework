import { Accordion, Button } from '@mantine/core';
import { data1 } from './utils';
import { useEffect, useState } from 'react';
import ListsTable from './components/ListsTable';
import { AdditionalData, DataLibraryList, Files, Query } from './types';
import {
  useDataLibrary,
  isCohortItem,
  FileItem,
  AdditionalDataItem,
  CohortItem,
  isAdditionalDataItem,
  isFileItem,
  RegisteredDataListEntry,
} from '@gen3/core';

const DataLibraryPanel = () => {
  const [currentLists, setCurrentLists] = useState([] as DataLibraryList[]);

  const { dataLibraryItems, setAllListsInDataLibrary, clearLibrary } =
    useDataLibrary(false);

  useEffect(() => {
    const savedLists = Object.entries(dataLibraryItems?.lists ?? {}).map(
      // for each List
      ([listId, dataList]) => {
        const listMembers = Object.keys(dataList.items).map((key) => {
          const [queries, files, additionalData] = [
            [] as Query[],
            [] as Files[],
            [] as AdditionalData[],
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
            const dataItemLocal = dataItem;
            Object.entries(dataItemLocal.items).forEach(([id, item]) => {
              if (isFileItem(item)) {
                const { description = '', type = '', guid } = item as FileItem;
                files.push({
                  name: item.name ?? id,
                  description,
                  type,
                  guid,
                  size: item.size ?? ('0' as any),
                });
              } else if (isAdditionalDataItem(item)) {
                const { description = '', documentationUrl = '' } =
                  item as AdditionalDataItem;
                additionalData.push({
                  name: item.name,
                  description,
                  documentation: documentationUrl,
                });
              } else {
                console.log('DataLibrary: unknown item', item);
              }
            });
          }
          return {
            name: key,
            queries: queries,
            files: files,
            additionalData: additionalData,
          };
        });
        return {
          name: dataList.name,
          setList: listMembers,
        };
      },
    );
    setCurrentLists(savedLists as any);
  }, [dataLibraryItems?.lists]);

  return (
    <div>
      <div className="flex flex-col w-screen">
        {currentLists.map(({ name, setList }, key) => {
          return (
            <div className="flex flex-col w-inherit" key={key}>
              <Accordion chevronPosition="left">
                <Accordion.Item value={name} key={name}>
                  <Accordion.Control>
                    <h4 className="font-bold text-lg ml-2 w-11/12">{name}</h4>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <ListsTable
                      data={[
                        ...setList.map(({ name }, j) => {
                          return {
                            title: name,
                            id: name,
                            numFiles: setList?.[j]?.files.length || 0,
                            isAddDataSource:
                              setList?.[j]?.additionalData.length !== 0
                                ? 'True'
                                : 'False',
                          };
                        }),
                      ]}
                      setList={setList}
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
