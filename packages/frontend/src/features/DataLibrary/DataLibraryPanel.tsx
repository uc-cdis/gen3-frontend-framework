import { Accordion, Button, Checkbox, Menu, TextInput } from '@mantine/core';
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
} from '@gen3/core';
import {
  MdSearch as SearchIcon,
  MdDelete as DeleteIcon,
  MdAdd as PlusIcon,
} from 'react-icons/md';
import { HiDotsVertical } from 'react-icons/hi';

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
    <div className="w-max ml-2">
      <div className="flex flex-col">
        <h4 className="font-bold">Search</h4>
        <div className="flex space-x-10">
          <div>
            <TextInput
              variant="filled"
              mt="md"
              placeholder="Search..."
              leftSection={<SearchIcon size="1.45em" />}
            />
          </div>
          <div className="flex">
            <div className="mt-5 ml-2">
              <Button
                variant="outline"
                style={{ padding: '4px', height: '90%' }}
              >
                <PlusIcon size="1.5em" />
              </Button>
            </div>
            <div className="mt-5 ml-2">
              <Button
                variant="outline"
                style={{ padding: '4px', height: '90%' }}
              >
                <DeleteIcon size="1.5em" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          {currentLists.map(({ name, setList }, key) => {
            return (
              <div className="flex">
                <div className="mt-4 ml-2 border-b">
                  <Checkbox></Checkbox>
                </div>
                <div className="flex">
                  <div className="flex flex-col w-fit" key={key}>
                    <Accordion chevronPosition="left">
                      <Accordion.Item value={name} key={name}>
                        <Accordion.Control>
                          <div className="flex justify-between">
                            <h4 className="text-md ml-2 w-80">{name}</h4>
                            <Menu>
                              <Menu.Target>
                                <Button
                                  onClick={(e) => e.stopPropagation()}
                                  variant="outline"
                                  style={{ padding: '4px', height: '90%' }}
                                >
                                  <HiDotsVertical />
                                </Button>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item>
                                  <Button
                                    variant="unstyled"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Save
                                  </Button>
                                </Menu.Item>
                                <Menu.Item>
                                  <Button
                                    variant="unstyled"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Test
                                  </Button>
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </div>
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataLibraryPanel;
