import { Accordion, Button } from '@mantine/core';
import { data1 } from './utils';
import { useEffect, useState } from 'react';
import ListsTable from './components/ListsTable';
import { AdditionalData, DataLibraryList, Files, Query } from './types';
import { useDataLibrary, LoadAllListData } from '@gen3/core';

const DataLibraryPanel = () => {
  const [currentLists, setCurrentLists] = useState([] as DataLibraryList[]);

  const { dataLibraryItems, setAllListsInDataLibrary, clearLibrary } =
    useDataLibrary(false);

  useEffect(() => {
    const savedLists = data1['lists'].map(({ name, items }) => {
      const setList = Object.keys(items).map((key) => {
        const [queries, files, additionalData] = [
          [] as Query[],
          [] as Files[],
          [] as AdditionalData[],
        ];
        const listType = items[key]['items'] ? 'items' : 'gql';
        const { name, type } = items[key];
        if (listType === 'gql') {
          queries.push({
            name,
            description: '',
            type,
          });
        }
        if (listType === 'items') {
          Object.keys(items[key]['items'] || {}).forEach((i) => {
            const subItems = items[key]?.['items'] ?? {};
            if (subItems[i]['type'] !== 'AdditionalData') {
              const { description = '', type = '' } = subItems[i];
              files.push({
                name: i,
                description,
                type,
                size: subItems?.[i]?.size ?? ('0' as any),
              });
            } else if (subItems[i]['type'] === 'AdditionalData') {
              const { description = '', docsUrl: documentation = '' } =
                subItems[i];
              additionalData.push({
                name: i,
                description,
                documentation,
              });
            }
          });
        }
        return {
          name: items[key].name,
          queries: queries,
          files: files,
          additionalData: additionalData,
        };
      });
      return {
        name: name,
        setList,
      };
    });
    setCurrentLists(savedLists as any);
  }, [data1]);

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
