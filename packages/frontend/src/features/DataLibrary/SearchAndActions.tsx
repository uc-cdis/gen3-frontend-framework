import React from 'react';
import { Button, Group, TextInput } from '@mantine/core';
import {
  MdAdd as PlusIcon,
  MdDelete as DeleteIcon,
  MdSearch as SearchIcon,
} from 'react-icons/md';
import { DataList } from '@gen3/core';

interface SearchAndActionsProps {
  createList: (item?: Partial<DataList>) => Promise<void>;
}

const SearchAndActions: React.FC<SearchAndActionsProps> = ({ createList }) => {
  return (
    <div className="flex flex-col w-full ml-2">
      <Group grow>
        <TextInput
          variant="filled"
          placeholder="Search..."
          leftSection={<SearchIcon size="1.45em" />}
        />

        <Button
          variant="outline"
          onClick={() => createList()}
          aria-label="create a new list"
        >
          <PlusIcon size="1.5em" />
        </Button>

        <Button variant="outline" aria-label="delete selected list">
          <DeleteIcon size="1.5em" />
        </Button>
      </Group>
    </div>
  );
};

export default SearchAndActions;
