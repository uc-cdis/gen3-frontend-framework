import {
  Accordion,
  Button,
  Checkbox,
  Group,
  Menu,
  Text,
  TextInput,
  UnstyledButton,
  AccordionControlProps,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import ListsTable from './tables/ListsTable';
import { DataLibraryList } from './types';
import {
  AdditionalDataItem,
  CohortItem,
  DataLibrary,
  FileItem,
  isAdditionalDataItem,
  isCohortItem,
  isFileItem,
  useDataLibrary,
} from '@gen3/core';

import { HiDotsVertical } from 'react-icons/hi';
import { data1 } from './utils';
import SearchAndActions from './SearchAndActions';

const DatasetAccordianControl = (
  props: AccordionControlProps & { id: string; name: string },
): JSX.Element => {
  const [renaming, setRenaming] = useState<string | undefined>(undefined);
  const { deleteListFromDataLibrary } = useDataLibrary(false);
  const { id, name } = props;
  return (
    <div className="flex items-center">
      <Accordion.Control {...props} className="w-4" />
      <div className="flex justify-between w-full items-center ml-4">
        {renaming && renaming === props.id ? (
          <TextInput value={name} />
        ) : (
          <Text fw={600} className="ml-2">
            {name}
          </Text>
        )}
        <Menu>
          <Menu.Target>
            <Button onClick={(e) => e.stopPropagation()} variant="outline">
              <HiDotsVertical />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>
              <UnstyledButton
                onClick={(e) => {
                  setRenaming(id);
                  e.stopPropagation();
                }}
              >
                Rename
              </UnstyledButton>
            </Menu.Item>
            <Menu.Item>
              <UnstyledButton
                onClick={async (e) => {
                  await deleteListFromDataLibrary(id);
                  e.stopPropagation();
                }}
              >
                Delete
              </UnstyledButton>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
};

const DataLibraryPanel = () => {
  const [currentLists, setCurrentLists] = useState<Array<DataLibraryList>>([]);

  const {
    dataLibraryItems,
    setAllListsInDataLibrary,
    clearLibrary,
    deleteListFromDataLibrary,
  } = useDataLibrary(false);

  useEffect(() => {
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
            <div className="flex" key={id}>
              <div className="mt-4 ml-2 border-b">
                <Checkbox />
              </div>
              <Accordion chevronPosition="left" classNames={{ root: 'w-full' }}>
                <Accordion.Item value={name} key={name}>
                  {/* } <Accordion.Control>
                    <div className="flex justify-between">

                        <Text fw={600} className="ml-2">
                          {name}
                        </Text>

                      <Menu>
                        <Menu.Target>
                          <Button
                            onClick={(e) => e.stopPropagation()}
                            variant="outline"
                          >
                            <HiDotsVertical />
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item>
                            <UnstyledButton
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              Rename
                            </UnstyledButton>
                          </Menu.Item>
                          <Menu.Item>
                            <UnstyledButton
                              onClick={async (e) => {
                                await deleteListFromDataLibrary(id);
                                e.stopPropagation();
                              }}
                            >
                              Delete
                            </UnstyledButton>
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  </Accordion.Control> */}
                  <DatasetAccordianControl id={id} name={name} />
                  <Accordion.Panel>
                    <ListsTable data={datasetItems} />
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
