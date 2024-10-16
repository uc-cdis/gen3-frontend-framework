import React from 'react';
import { Button, Group, TextInput } from '@mantine/core';
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
      <Group justify="space-between" className="mb-2">
        <TextInput
          variant="filled"
          placeholder="Search..."
          leftSection={<SearchIcon size="1.45em" />}
        />
        <Button
          variant="outline"
          onClick={() => gatherData()}
          aria-label="Gather Selected Data"
        >
          <CollectIcon size="1.5em" />
        </Button>
        <Button variant="outline" aria-label="Download List">
          <DownloadIcon size="1.5em" />
        </Button>
        <Button
          variant="outline"
          onClick={() => createList()}
          aria-label="create a new list"
        >
          <PlusIcon size="1.5em" />
        </Button>
      </Group>
    </div>
  );
};

export default SearchAndActions;
