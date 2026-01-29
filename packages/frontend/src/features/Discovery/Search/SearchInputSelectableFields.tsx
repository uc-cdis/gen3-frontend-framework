import React, { useState } from 'react';
import { MdSearch as SearchIcon, MdClose as CloseIcon } from 'react-icons/md';
import { Checkbox, Radio, TextInput } from '@mantine/core';
import { SearchInputProps } from './types';
import { SearchMode } from '../constants';

interface SearchInputSelectableFieldsProps {
  searchMode: SearchMode;
  setSearchMode: React.Dispatch<React.SetStateAction<SearchMode>>;
  searchableTextFields: string[] | undefined;
  searchableAndSelectableTextFields:
    | {
        [key: string]: string;
      }
    | undefined;
  setSelectedFieldsForSearchIndexing: React.Dispatch<
    React.SetStateAction<string[]>
  >;
}

const SearchInputSelectableFields = ({
  searchMode,
  setSearchMode,
  searchableTextFields,
  searchableAndSelectableTextFields,
  setSelectedFieldsForSearchIndexing,
}: SearchInputSelectableFieldsProps) => {
  const [checkboxGroupValues, setCheckboxGroupValues] = useState(
    [] as string[],
  );
  if (!searchableAndSelectableTextFields || !searchableTextFields) return;
  const onRadioChange = (value: string) => {
    setSearchMode(value as SearchMode);
    if (value === SearchMode.FULL_TEXT) {
      setSelectedFieldsForSearchIndexing([
        ...searchableTextFields,
        ...Object.values(searchableAndSelectableTextFields),
      ]);
    } else {
      setCheckboxGroupValues(checkboxGroupValues);
      setSelectedFieldsForSearchIndexing(checkboxGroupValues);
    }
  };

  const onCheckboxGroupChange = (currentCheckedValues: string[]) => {
    setCheckboxGroupValues(currentCheckedValues);
    setSelectedFieldsForSearchIndexing(currentCheckedValues);
  };

  const checkboxGroupOptions = Object.entries(
    searchableAndSelectableTextFields,
  ).map(([key, value]) => ({ label: key, value }));

  return (
    <>
      <Radio.Group onChange={onRadioChange} value={searchMode}>
        <div className="flex space-x-4 pt-4">
          <Radio value={SearchMode.FULL_TEXT} label="Full Text Search" />
          <Radio
            value={SearchMode.RESTRICTED}
            label="Restrict Search to Selected Fields"
          />
        </div>
      </Radio.Group>
      <Checkbox.Group
        value={checkboxGroupValues}
        onChange={onCheckboxGroupChange}
      >
        <div className="flex flex-wrap">
          {checkboxGroupOptions.map((checkbox, index) => (
            <div key={index} className="flex items-center mt-1 mr-4">
              <Checkbox
                key={index}
                label={checkbox.label}
                value={checkbox.value as string}
                disabled={searchMode === SearchMode.FULL_TEXT}
              />
            </div>
          ))}
        </div>
      </Checkbox.Group>
    </>
  );
};

export default SearchInputSelectableFields;
