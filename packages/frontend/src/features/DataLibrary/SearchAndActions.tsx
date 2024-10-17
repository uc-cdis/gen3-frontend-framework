import React from 'react';
import { Button, Group, TextInput, Tooltip } from '@mantine/core';
import {
  MdAdd as PlusIcon,
  MdDelete as DeleteIcon,
  MdSearch as SearchIcon,
  MdDownload as DownloadIcon,
} from 'react-icons/md';
import { BsFillCollectionFill as CollectIcon } from 'react-icons/bs';
import { Datalist } from '@gen3/core';

interface SearchAndActionsProps {
  createList: (item?: Partial<Datalist>) => Promise<void>;
  gatherData: () => void;
}

const SearchAndActions: React.FC<SearchAndActionsProps> = ({
  createList,
  gatherData,
}) => {
  return (
    <div className="flex flex-col w-full ml-2">
      <div className=" flex mb-2">
        <TextInput
          variant="filled"
          placeholder="Search..."
          leftSection={<SearchIcon size="1.45em" />}
        />
        <Tooltip label="Create a new empty list">
          <Button
            size="compact-md"
            variant="transparent"
            onClick={() => createList()}
            aria-label="create a new list"
          >
            <PlusIcon size="1.5em" />
          </Button>
        </Tooltip>
        <Tooltip label="Gather selections">
          <Button
            size="compact-md"
            variant="transparent"
            onClick={() => gatherData()}
            aria-label="Gather Selected Data"
          >
            <CollectIcon size="1.5em" />
          </Button>
        </Tooltip>
        <Tooltip label="Download Manifest of selected items">
          <Button
            size="compact-md"
            variant="transparent"
            aria-label="Download Manifest of Selected Items"
          >
            <DownloadIcon size="1.5em" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default SearchAndActions;
