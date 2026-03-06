import React, { useState } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { Button, Loader, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import ErrorCard from '../MessageCards/ErrorCard';
import {
  CoreState,
  createNewCohort,
  selectAvailableCohorts,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';

export interface SaveCohortModalProps {
  readonly initialName?: string;
  readonly disallowedNames?: string[];
  readonly filters: Record<string, any>;
  readonly validate?: boolean;
  readonly setAsCurrentCohort?: boolean;
  readonly disallowDuplicateNames?: boolean;
}

export const SaveCohortModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<SaveCohortModalProps>) => {
  const {
    initialName = '',
    disallowedNames = [],
    filters,
    validate = true,
    setAsCurrentCohort = true,
    disallowDuplicateNames = true,
  } = innerProps;
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useCoreDispatch();

  const cohorts = useCoreSelector((state: CoreState) =>
    selectAvailableCohorts(state),
  );

  const form = useForm({
    initialValues: {
      name: initialName,
    },
    validate: {
      name: (value) => {
        if (!validate) return null;
        if (value.length === 0) {
          return 'Please fill out this field.';
        } else if (disallowedNames.includes(value.trim().toLowerCase())) {
          return `${value} is not a valid name for a saved cohort. Please try another name.`;
        } else if (
          disallowDuplicateNames &&
          cohorts.some(
            (cohort) =>
              cohort.name.toLowerCase() === value.trim().toLowerCase(),
          )
        ) {
          return `${value} already exists. Please try another name.`;
        }
        return null;
      },
    },
  });

  const { error: _, ...inputProps } = form.getInputProps('name');
  const validationError = form.errors.name;
  const error = validationError && (
    <ErrorCard message={validationError as string} />
  );

  const handleSave = async () => {
    if (form.validate().hasErrors || isSaving) return;

    setIsSaving(true);
    try {
      dispatch(
        createNewCohort({
          name: form.values.name,
          filters,
          setAsCurrent: setAsCurrentCohort,
        }),
      );
      context.closeModal(id);
    } catch (error) {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="font-content mt-1 mr-6 mb-5 ml-3">
        <p className="mb-2 text-sm font-content">
          Provide a name to save the cohort.
        </p>
        <TextInput
          withAsterisk
          label="Name"
          placeholder="New Cohort Name"
          description={<span>Maximum 100 characters</span>}
          classNames={{
            description: 'mt-1',
            input:
              'font-content data-[invalid=true]:text-utility-error data-[invalid=true]:border-utility-error',
            error: 'text-utility-error',
          }}
          data-autofocus
          maxLength={100}
          error={error}
          inputWrapperOrder={['label', 'input', 'error', 'description']}
          {...inputProps}
          aria-required
          data-testid="textbox-name-input-field"
        />
      </div>
      <div className="bg-base-lightest p-4">
        <div className="flex justify-end gap-3">
          <Button
            data-testid="button-cancel-save"
            variant="outline"
            classNames={{ root: 'bg-base-max' }}
            color="secondary"
            onClick={() => context.closeModal(id)}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="secondary"
            onClick={handleSave}
            data-testid="button-save-cohort"
            leftSection={
              isSaving ? <Loader size={15} color="white" /> : undefined
            }
          >
            Save
          </Button>
        </div>
      </div>
    </>
  );
};
