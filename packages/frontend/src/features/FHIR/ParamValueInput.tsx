import React, { type ReactElement, type Ref } from 'react';
import { Select, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { ParamType } from '@gen3/core';
import { COUNT_HINT, DATE_PREFIXES } from './constants';
import type { ParamRow } from './params';

// Commas mean OR for every param type; the hint goes on the common text ones
const PLACEHOLDERS: Partial<Record<ParamType, string>> = {
  string: 'Text (commas = OR)',
  token: 'Code or system|code (commas = OR)',
  reference: 'Type/id, e.g. Patient/123',
  uri: 'URI',
  number: 'Number, e.g. 10',
  quantity: 'e.g. gt5.4|http://unitsofmeasure.org|mg',
  composite: 'e.g. code$value',
};

interface ParamValueInputProps {
  row: ParamRow;
  onChange: (changes: Partial<ParamRow>) => void;
  // Goes on the first input: the prefix for dates, the text box otherwise
  ref?: Ref<HTMLInputElement>;
}

// Dates get a prefix and a picker
const ParamValueInput = ({
  row,
  onChange,
  ref,
}: ParamValueInputProps): ReactElement => {
  if (row.type === 'date') {
    return (
      <div className="flex gap-2">
        <Select
          ref={ref}
          aria-label={`${row.name} prefix`}
          data={DATE_PREFIXES}
          value={row.prefix}
          onChange={(prefix) => prefix && onChange({ prefix })}
          allowDeselect={false}
          className="w-48"
        />
        <DateInput
          aria-label={`${row.name} date`}
          placeholder="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          value={row.value || null}
          onChange={(date) => onChange({ value: date ?? '' })}
          clearable
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <TextInput
      ref={ref}
      aria-label={`${row.name} value`}
      placeholder={row.name === '_count' ? COUNT_HINT : PLACEHOLDERS[row.type]}
      value={row.value}
      onChange={(e) => onChange({ value: e.currentTarget.value })}
      classNames={{ input: 'font-mono' }}
    />
  );
};

export default ParamValueInput;
