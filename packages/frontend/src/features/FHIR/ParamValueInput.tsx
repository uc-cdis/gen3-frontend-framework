import React, { type ReactElement, type Ref, useState } from 'react';
import { ActionIcon, Popover, Select, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { FiCalendar } from 'react-icons/fi';
import type { ParamType } from '@gen3/core';
import { COUNT_HINT, DATE_PREFIXES } from './constants';
import { rowError, type ParamRow } from './params';

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

// The month the calendar opens on: 1990 → Jan 1990, 1990-05 → May 1990
const openingDate = (date: string): string => `${date}-01-01`.slice(0, 10);

interface CalendarButtonProps {
  name: string;
  // The typed date if it's valid, which may be partial
  date?: string;
  onPick: (date: string) => void;
}

// Picking a day fills in a full date. Partial dates are typed.
const CalendarButton = ({
  name,
  date,
  onPick,
}: CalendarButtonProps): ReactElement => {
  const [opened, setOpened] = useState(false);
  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      shadow="md"
      trapFocus
      returnFocus
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={`Pick ${name} from a calendar`}
          onClick={() => setOpened((o) => !o)}
        >
          <FiCalendar />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <DatePicker
          value={date?.length === 10 ? date : null}
          defaultDate={date ? openingDate(date) : undefined}
          onChange={(picked) => {
            if (picked) onPick(picked);
            setOpened(false);
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};

// Dates get a prefix, a typed value and a calendar
const ParamValueInput = ({
  row,
  onChange,
  ref,
}: ParamValueInputProps): ReactElement => {
  const error = rowError(row);
  if (row.type === 'date') {
    return (
      <div className="flex items-start gap-2">
        <Select
          ref={ref}
          aria-label={`${row.name} prefix`}
          data={DATE_PREFIXES}
          value={row.prefix}
          onChange={(prefix) => prefix && onChange({ prefix })}
          allowDeselect={false}
          className="w-48"
        />
        <TextInput
          aria-label={`${row.name} date`}
          placeholder="YYYY, YYYY-MM or YYYY-MM-DD"
          value={row.value}
          onChange={(e) => onChange({ value: e.currentTarget.value })}
          error={error}
          rightSection={
            <CalendarButton
              name={row.name}
              date={error ? undefined : row.value.trim()}
              onPick={(value) => onChange({ value })}
            />
          }
          rightSectionPointerEvents="all"
          classNames={{ input: 'font-mono' }}
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
      error={error}
      classNames={{ input: 'font-mono' }}
    />
  );
};

export default ParamValueInput;
