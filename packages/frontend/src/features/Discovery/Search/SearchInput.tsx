import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  ChangeEvent,
} from 'react';
import { MdSearch as SearchIcon, MdClose as CloseIcon } from 'react-icons/md';
import { TextInput, Tooltip } from '@mantine/core';

interface SearchInputProps {
  searchChanged: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchInput = ({ searchChanged, placeholder } : SearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  console.log("searchTerm", searchTerm);
  return (
    <div className="relative">
      <TextInput
        icon={<SearchIcon size={24} />}
        placeholder={placeholder || 'Search...'}
        data-testid="textbox-search-bar"
        aria-label="App Search Input"
        value={searchTerm}
        onChange={(event) => {
          searchChanged(event.target.value);
          setSearchTerm(event.target.value);
        }}
        classNames={{
          input: 'focus:border-2 focus:border-primary text-sm',
        }}
        size="sm"
        rightSection={
          searchTerm.length > 0 && (
            <CloseIcon
              onClick={() => {
                setSearchTerm('');
                searchChanged('');
              }}
              className="cursor-pointer"
              data-testid="search-input-clear-search"
            />
          )
        }
      />
    </div>
  );
};

export default SearchInput;
