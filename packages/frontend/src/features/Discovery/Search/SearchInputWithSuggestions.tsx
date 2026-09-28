import React from 'react';
import { MdClose as CloseIcon, MdSearch as SearchIcon } from 'react-icons/md';
import { Autocomplete } from '@mantine/core';
import { SearchInputProps } from './types';

interface SearchInputWithAutoSuggestProps extends SearchInputProps {
  suggestions: string[];
  limit?: number;
  searchBarTerms: string[];
  setSearchBarTerms: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchInputWithSuggestions = ({
  searchBarTerms,
  setSearchBarTerms,
  searchChanged,
  placeholder,
  label,
  suggestions,
  clearSearch = () => null,
}: SearchInputWithAutoSuggestProps) => {
  return (
    <div className="relative">
      <Autocomplete
        data={suggestions}
        label={label}
        leftSection={<SearchIcon size={24} />}
        placeholder={placeholder || 'Search...'}
        data-testid="discovery-textbox-search-bar"
        aria-label="DiscoverySearch Input"
        value={searchBarTerms.join(' ')}
        onChange={(value) => {
          searchChanged(value);
          setSearchBarTerms(value.split(' '));
        }}
        classNames={{
          input: 'focus:border-2 focus:border-primary text-sm',
        }}
        size="sm"
        rightSection={
          searchBarTerms.length > 0 && (
            <CloseIcon
              onClick={() => {
                setSearchBarTerms([]);
                searchChanged('');
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

export default SearchInputWithSuggestions;
