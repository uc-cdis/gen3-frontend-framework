import React, { useState } from 'react';
import { isEqual } from 'lodash';
import {
  Checkbox,
  TextInput,
  Select,
  Tooltip,
  NumberInput,
  ActionIcon,
} from '@mantine/core';
import {
  MdExpandMore as DropdownIcon,
  MdInfo as InfoIcon,
} from 'react-icons/md';
import { DataDictionary } from '../../Dictionary';
import { DictionaryProperty } from '../../Dictionary/types';
import EnumCombobox from './EnumCombobox';

interface FormLabelProps {
  readonly field: string;
  readonly required: boolean;
}

type FormElementProps = DictionaryProperty & FormLabelProps;

const DATETIME_FORMAT = [
  { format: 'date-time', type: 'string' },
  { type: 'null' },
];

const FormLabel = (props: FormElementProps) => {
  const description = props?.description
    ? props.description
    : props?.term?.description
      ? props.term.description
      : undefined;

  return (
    <div className="flex items-center">
      {props?.required ? <p className="text-secondary-dark mr-2">*</p> : null}
      <label htmlFor={`input-${props.field}`} className="font-bold">
        {props?.field}
      </label>
      {description && (
        <Tooltip
          label={description}
          multiline
          events={{ hover: true, focus: true, touch: false }}
        >
          <ActionIcon
            variant="subtle"
            aria-label={`${props?.field} field information`}
          >
            <InfoIcon className="text-secondary-dark" />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
};

const determineType = (props: FormElementProps) => {
  if (props?.enum) {
    return 'enum';
  } else if (isEqual(props?.oneOf, DATETIME_FORMAT)) {
    return 'datetime';
  } else if (Array.isArray(props?.type) && props?.type?.includes('string')) {
    return 'string';
  }

  return props?.type;
};

const FormElement = (props: FormElementProps) => {
  const type = determineType(props);

  switch (type) {
    case 'enum':
      return (
        <>
          <FormLabel {...props} />
          <EnumCombobox {...props} id={`input-${props.field}`} />
        </>
      );
    case 'string':
    case 'datetime':
      return (
        <>
          <FormLabel {...props} />
          <TextInput id={`input-${props.field}`} />
        </>
      );
    case 'boolean':
      return (
        <>
          <FormLabel {...props} />
          <Checkbox
            color="secondary"
            classNames={{
              root: 'ml-2',
              input: '!focus:bg-secondary-darker !hover:bg-secondary-darker',
            }}
            id={`input-${props.field}`}
          />
        </>
      );
    case 'number':
    case 'integer':
      return (
        <>
          <FormLabel {...props} />
          <NumberInput id={`input-${props.field}`} />
        </>
      );
    default:
      console.log(`Field ${props?.field} not supported`, props);
      return (
        <>
          <FormLabel {...props} />
          <p>{'Input not supported'}</p>
        </>
      );
  }
};

const SubmissionForm = ({ dictionary }: { dictionary: DataDictionary }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-auto flex flex-col p-2 pr-4 gap-4">
        <span className="flex items-center gap-2">
          <InfoIcon className="text-secondary-dark" aria-hidden="true" />{' '}
          Required fields are marked with an asterisk
        </span>
        <div>
          <label htmlFor="submission-form-select" className="font-bold">
            Submission form
          </label>
          <Select
            data={Object.keys(dictionary)}
            value={selectedNode}
            onChange={(val) => setSelectedNode(val)}
            placeholder="Select submission form"
            rightSection={
              <DropdownIcon
                className="text-secondary-dark"
                size="2em"
                aria-hidden
              />
            }
            id="submission-form-select"
          />
        </div>

        {selectedNode && (
          <div className="flex flex-col gap-2">
            {Object.entries(dictionary[selectedNode].properties).map(
              ([entry, dictionaryProperties]) => (
                <FormElement
                  field={entry}
                  required={(dictionary[selectedNode]?.required || []).includes(
                    entry,
                  )}
                  {...dictionaryProperties}
                />
              ),
            )}
          </div>
        )}
      </div>
      <div className="bg-white sticky bottom-0 left-0 border-t-1 p-4 z-10">
        <button className="border-1 border-solid rounded-md border-primary text-primary p-2 w-full">
          {'Generate Submission JSON from Form'}
        </button>
      </div>
    </>
  );
};

export default SubmissionForm;
