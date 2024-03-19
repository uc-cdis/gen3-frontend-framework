import React, { useState } from 'react';
import { MdSearch as SearchIcon, MdClose as CloseIcon } from 'react-icons/md';
import { Autocomplete } from '@mantine/core';
import { SearchInputProps } from './types';

interface SearchInputWithAutoSuggestProps extends SearchInputProps {
  suggestions: string[];
  limit?: number;
}

const SearchInputWithSuggestions = ({
  searchChanged,
  placeholder,
  label,
  suggestions,
  clearSearch = () => null,
}: SearchInputWithAutoSuggestProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="relative">
      <Autocomplete
        data={suggestions}
        label={label}
        icon={<SearchIcon size={24} />}
        placeholder={placeholder || 'Search...'}
        data-testid="discovery-textbox-search-bar"
        aria-label="DiscoverySearch Input"
        value={searchTerm}
        onChange={(value) => {
          searchChanged(value);
          setSearchTerm(value);
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
