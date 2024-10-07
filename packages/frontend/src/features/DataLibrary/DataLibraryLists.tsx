import { Accordion } from '@mantine/core';
import DataSetContentsTable from './tables/DatasetContentsTable';
import { DataLibraryList } from './types';
import { useDataLibrary } from '@gen3/core';
import SearchAndActions from './SearchAndActions';
import { DatasetAccordianControl } from './DatasetAccordianControl';
import { DataLibrarySelectionProvider } from './tables/SelectionContext';
import { selectAllDatasetMembers } from './tables/selection';

interface DataLibraryListsProps {
  dataLists: Array<DataLibraryList>;
}

const DataLibraryLists: React.FC<DataLibraryListsProps> = ({ dataLists }) => {
  const {
    dataLibraryItems,
    addListToDataLibrary,
    updateListInDataLibrary,
    deleteListFromDataLibrary,
  } = useDataLibrary(false);

  const updateList = async (listId: string, update: Record<string, any>) => {
    if (!dataLibraryItems) return;
    await updateListInDataLibrary(listId, {
      ...dataLibraryItems.lists[listId],
      ...update,
      updatedTime: new Date().toISOString(),
    });
  };

  const removeItemFromList = async (listId: string, itemId: string) => {
    if (!dataLibraryItems) return;

    const { [itemId]: removedKey, ...newObject } =
      dataLibraryItems.lists[listId].items;
    await updateListInDataLibrary(listId, {
      ...dataLibraryItems.lists[listId],
      items: newObject,
      updatedTime: new Date().toISOString(),
    });
  };

  const handleSelectList = (listId: string) => {
    if (!dataLibraryItems?.lists[listId]) {
      return;
    }

    const selectAllDatasets = selectAllDatasetMembers(
      Object.keys(dataLibraryItems.lists[listId]),
      dataLists.lists[listId],
    );
  };

  console.log('datalist 2', dataLists);

  return (
    <div className="flex flex-col w-full ml-2">
      <SearchAndActions createList={addListToDataLibrary} />
      <DataLibrarySelectionProvider>
        {dataLists?.map(({ id, name, datalistMembers }) => {
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
                    <DataSetContentsTable
                      listId={id}
                      data={datalistMembers}
                      removeList={removeItemFromList}
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
          );
        })}
      </DataLibrarySelectionProvider>
    </div>
  );
};

export default DataLibraryLists;
