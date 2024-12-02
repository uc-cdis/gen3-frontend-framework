import React from 'react';
import { Accordion, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useDataLibrary } from '@gen3/core';
import SearchAndActions from './SearchAndActions';
import { useDataLibrarySelection } from './selection/SelectionContext';
import SelectedItemsModal from './modals/SelectedItemsModal';
import { DatalistAccordionItem } from './DatalistAccordionItem';
import { DataLibraryConfig } from './types';
import { ErrorCard } from '../../components/MessageCards';

const DataLibraryLists: React.FC<DataLibraryConfig> = ({ useAPI, actions }) => {
  const {
    dataLibrary,
    isError,
    error: dataLibraryError,
    addListToDataLibrary,
    updateListInDataLibrary,
    deleteListFromDataLibrary,
  } = useDataLibrary(useAPI);

  const [selectedItemsOpen, { open, close }] = useDisclosure(false);
  const { gatherSelectedItems } = useDataLibrarySelection();

  const gatherData = () => {
    gatherSelectedItems(dataLibrary);
    open();
  };

  if (isError) {
    console.log('Data Library Error', dataLibraryError);
    return (
      <div className="flex flex-col w-full ml-2">
        <Center>
          <ErrorCard message={'There was a error getting the library'} />
        </Center>
      </div>
    );
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
