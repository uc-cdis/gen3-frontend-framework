import React, { useState } from 'react';
import { Combobox, useCombobox, Pill, PillsInput } from '@mantine/core';
import { MdExpandMore as DropdownIcon } from 'react-icons/md';
import { DictionaryProperty } from '../../Dictionary/types';

const EnumCombobox = (props: DictionaryProperty & { id: string }) => {
  const [value, setValue] = useState<string[]>([]);
  const combobox = useCombobox();

  const handleValueSelect = (val: string) =>
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val],
    );

  const handleValueRemove = (val: string) =>
    setValue((current) => current.filter((v) => v !== val));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          rightSection={
            <DropdownIcon
              className="text-secondary-dark"
              size="2em"
              aria-hidden
            />
          }
          id={props.id}
        >
          <Pill.Group>
            {value.map((item) => (
              <Pill
                key={item}
                withRemoveButton
                onRemove={() => handleValueRemove(item)}
              >
                {item}
              </Pill>
            ))}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                onChange={() => {
                  combobox.updateSelectedOptionIndex();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && value.length > 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown>
        <Combobox.Options>
          {(props?.enum || []).map((enumVal) => (
            <Combobox.Option value={enumVal} key={enumVal}>
              {enumVal}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default EnumCombobox;
