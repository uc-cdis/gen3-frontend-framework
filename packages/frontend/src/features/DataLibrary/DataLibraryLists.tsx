import React from 'react';
import { Accordion, Center, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useDataLibrary } from '@gen3/core';
import SearchAndActions from './SearchAndActions';
import { useDataLibrarySelection } from './selection/SelectionContext';
import SelectedItemsModal from './modals/SelectedItemsModal';
import { DatalistAccordionItem } from './DatalistAccordionItem';
import { DataLibraryConfig } from './types';
import { ErrorCard } from '../../components/MessageCards';

const DataLibraryLists: React.FC<DataLibraryConfig> = ({
  useAPI,
  actions,
  size,
}) => {
  const {
    dataLibrary,
    isLoading,
    isUpdating,
    error: dataLibraryError,
    addListToDataLibrary,
    updateListInDataLibrary,
    deleteListFromDataLibrary,
  } = useDataLibrary();

  console.log(dataLibrary);

  const [selectedItemsOpen, { open, close }] = useDisclosure(false);
  const { gatherSelectedItems } = useDataLibrarySelection();

  const gatherData = () => {
    gatherSelectedItems(dataLibrary);
    open();
  };

  if (dataLibraryError?.isError) {
    if (dataLibraryError?.status === 401)
      return (
        <div className="flex flex-col w-full ml-2">
          <Center>
            <ErrorCard message="You are not authorized to access the library. Try logging in again." />
          </Center>
        </div>
      );
    else
      notifications.show({
        position: 'top-center',
        color: 'red',
        title: 'Data Library Error',
        message: dataLibraryError?.message,
        autoClose: 2000,
      });
  }

  return (
    <div className="flex flex-col w-full ml-2">
      <SelectedItemsModal
        opened={selectedItemsOpen}
        onClose={close}
        size="auto"
        actions={actions}
      />
      <SearchAndActions
        createList={addListToDataLibrary}
        gatherData={gatherData}
      />
      <div className="flex items-center">
        <LoadingOverlay visible={isLoading} />
        <Accordion
          chevronPosition="left"
          classNames={{
            root: 'w-full',
            control: 'data-active:bg-secondary-lightest',
          }}
        >
          {dataLibrary &&
            Object.values(dataLibrary).map((datalist) => {
              return (
                <DatalistAccordionItem
                  dataList={datalist}
                  key={datalist.id}
                  size={size}
                  isUpdating={isUpdating}
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
