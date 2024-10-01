import React from 'react';
import { Button, Group, TextInput, Text } from '@mantine/core';
import {
  MdAdd as PlusIcon,
  MdDelete as DeleteIcon,
  MdSearch as SearchIcon,
} from 'react-icons/md';

const SearchAndActions = () => {
  return (
    <div className="flex flex-col w-full ml-2">
      <Group grow>
        <TextInput
          variant="filled"
          placeholder="Search..."
          leftSection={<SearchIcon size="1.45em" />}
        />

        <Button variant="outline" onClick={() => {}}>
          <PlusIcon size="1.5em" />
        </Button>

        <Button variant="outline">
          <DeleteIcon size="1.5em" />
        </Button>
      </Group>
    </div>
  );
};

export default SearchAndActions;
