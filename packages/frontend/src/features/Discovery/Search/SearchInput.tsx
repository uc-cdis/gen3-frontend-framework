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
  onSearchChanged: (searchTerm: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
}

const SearchInput: React.FC = () => {
  const [searchResults, setSearchResults] = useState<[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchTerm('');
  }, [setSearchResults, setSearchTerm]);

  const onSearchChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative">
      <TextInput
        icon={<SearchIcon size={24} />}
        placeholder="Search"
        data-testid="textbox-search-bar"
        aria-label="App Search Input"
        value={searchTerm}
        onChange={onSearchChanged}
        classNames={{
          input: 'focus:border-2 focus:border-primary text-sm',
        }}
        size="sm"
        rightSection={
          searchTerm.length > 0 && (
            <CloseIcon
              onClick={() => {
                clearSearch();
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
