import React, { useState } from 'react';
import { Combobox, InputBase, useCombobox } from '@mantine/core';
import { useDataLibrary } from '@gen3/core';
import { useAnalysisTools } from '../../../lib/common/analysisToolFramework';

const AddToDataLibrary = () => {
  const { useDataLibraryServiceAPI } = useAnalysisTools();
  const { isLoading, isError, dataLibrary } = useDataLibrary(
    useDataLibraryServiceAPI ?? false,
  );

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [data, setData] = useState(dataLibrary);
  const [value, setValue] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const exactOptionMatch = data.some((item: any) => item === search);
  const filteredOptions = exactOptionMatch
    ? data
    : data.filter((item: any) =>
        item.toLowerCase().includes(search.toLowerCase().trim()),
      );

  const options = filteredOptions.map((item: any) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        setValue(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          rightSection={<Combobox.Chevron />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(value || '');
          }}
          placeholder="Search value"
          rightSectionPointerEvents="none"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options}
          {!exactOptionMatch && search.trim().length > 0 && (
            <Combobox.Option value="$create">+ Create {search}</Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default AddToDataLibrary;
