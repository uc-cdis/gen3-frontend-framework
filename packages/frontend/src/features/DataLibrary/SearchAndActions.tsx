import React from 'react';
import { ActionIcon, Button, Group, Tooltip } from '@mantine/core';
// import { MdAdd as PlusIcon, MdSearch as SearchIcon } from 'react-icons/md';
import { Datalist } from '@gen3/core';
import { Icon } from '@iconify/react';
import { IconSize } from './types';
import { useDataLibrarySelection } from './selection/SelectionContext';

interface SearchAndActionsProps {
  createList: (item?: Partial<Datalist>) => Promise<void>;
  gatherData: () => void;
  size?: string;
}

const SearchAndActions: React.FC<SearchAndActionsProps> = ({
  createList,
  gatherData,
  size = 'sm',
}) => {
  const { selections, clearSelections } = useDataLibrarySelection();
  const retrieveDisabled = Object.keys(selections).length === 0;
  const iconSize = IconSize[size] || IconSize['sm'];
  return (
    <div className="flex justify-between p-2 bg-primary-dark text-primary-contrast-dark">
      <Group>
        <Tooltip label="Retrieve selections">
          <Button
            disabled={retrieveDisabled}
            // disabled={Object.keys(selections).length === 0}
            size={`compact-${size}`}
            variant="outline"
            onClick={() => gatherData()}
            aria-label="Retrieve Selected Data"
            classNames={{ root: 'bg-base-max hover:bg-base-light' }}
          >
            Retrieve Selected
          </Button>
        </Tooltip>
        <Tooltip label="Clear selections">
          <ActionIcon
            disabled={retrieveDisabled}
            variant="outline"
            size={size}
            onClick={() => {
              clearSelections();
            }}
            color="accent-contrast.4"
            aria-label="clear selections"
          >
            <Icon icon="gen3:clear-list" width={iconSize} height={iconSize} />
          </ActionIcon>
        </Tooltip>
        {/* ----  TODO: enable these
        <Tooltip label="Create a new empty list">
          <Button
            hidden={true}
            size="compact-md"
            variant="outline"
            onClick={() => createList()}
            aria-label="create a new list"
            classNames={{ root: 'bg-base-max hover:bg-base-light' }}
          >
            <PlusIcon size="1.5em" />
          </Button>
        </Tooltip>
        <Tooltip label="Download Manifest of selected items">
          <Button
            size="compact-md"
            variant="outline"
            aria-label="Download Manifest of Selected Items"
            classNames={{ root: 'bg-base-max hover:bg-base-light' }}
          >
            <Icon icon="gen3:download-alt" height={24} width={24} />
          </Button>
        </Tooltip>
        */}
      </Group>
      {/* ---
      <TextInput
        variant="filled"
        placeholder="Search..."
        leftSection={<SearchIcon size="1.45em" />}
      />
      --- */}
    </div>
  );
};

export default SearchAndActions;
