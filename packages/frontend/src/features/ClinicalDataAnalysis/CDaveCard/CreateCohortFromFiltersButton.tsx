import React, { useState } from 'react';
import { LoadingOverlay, Tooltip } from '@mantine/core';
import { FilterSet, useLazyGetObjectIdsQuery } from '@gen3/core';
import { WithOrWithoutCohortType } from './types';
import AddToExistingCohortModal from './AddToExistingCohortModal';
import { modals } from '@mantine/modals';
import { getObjectIdsFromFilter } from './utils';
import { DropdownWithIcon } from '../../../components/DropdownWithIcon/DropdownWithIcon';
import { CountsIcon } from '../../../components/tailwindComponents';
import { labelToPlural } from '../../../utils/labels';

interface CreateCohortFromFiltersButtonProps {
  filters: FilterSet;
  numObjects: number;
  index: string;
  objectIdField: string;
  objectTypename: string;
}

const CreateCohortFromFiltersButton = ({
  filters,
  numObjects,
  index,
  objectIdField,
  objectTypename,
}: CreateCohortFromFiltersButtonProps) => {
  const [openSelectCohorts, setOpenSelectCohorts] = useState(false);
  const [withOrWithoutCohort, setWithOrWithoutCohort] =
    useState<WithOrWithoutCohortType>(undefined);
  const [fetchIds, { isFetching }] = useLazyGetObjectIdsQuery();

  const openSaveCohortModal = (caseIds: ReadonlyArray<string>) => {
    const cohortFilters = {
      mode: 'and',
      root: {
        [objectIdField]: {
          operator: 'in',
          field: objectIdField,
          operands: Array.from(caseIds ?? []),
        },
      },
    };

    modals.openContextModal({
      modal: 'saveCohortModal',
      title: 'Save Cohort',
      size: 'md',
      zIndex: 1200,
      innerProps: {
        filters: {
          [index]: cohortFilters,
        },
      },
    });
  };

  const handleSaveOnlySelectedCases = async () => {
    if (numObjects < 1) return;

    try {
      // Check if we can extract case IDs directly
      const directCaseIds = getObjectIdsFromFilter(filters, objectIdField);

      if (directCaseIds) {
        // Use extracted IDs directly
        openSaveCohortModal(directCaseIds);
      } else {
        // Fetch case IDs from current filters
        const result = await fetchIds({
          filters: filters,
          field: objectIdField,
          index: index,
        }).unwrap();
        openSaveCohortModal(result?.ids ?? ([] as ReadonlyArray<string>));
      }
    } catch (error) {
      console.error('Error fetching case IDs:', error);
    }
  };

  const unitLabel = labelToPlural(objectTypename);

  const dropDownIcon = (
    <DropdownWithIcon
      customTargetButtonDataTestId="button-save-new-cohort-cases-table"
      dropdownElements={[
        {
          title: `Only Selected ${unitLabel}`,
          onClick: handleSaveOnlySelectedCases,
        },
        {
          title: `Existing Cohort With Selected ${unitLabel}`,
          onClick: () => {
            setWithOrWithoutCohort('with');
            setOpenSelectCohorts(true);
          },
        },
        {
          title: `Existing Cohort Without Selected ${unitLabel}`,
          onClick: () => {
            setWithOrWithoutCohort('without');
            setOpenSelectCohorts(true);
          },
        },
      ]}
      TargetButtonChildren="Save New Cohort"
      targetButtonTooltip="Save a new cohort based on selection"
      disableTargetWidth={true}
      targetButtonDisabled={numObjects === 0}
      menuLabelText={`${numObjects.toLocaleString()}
        ${numObjects != 1 ? labelToPlural(objectTypename, true) : objectTypename}`}
      menuLabelCustomClass="bg-primary text-primary-contrast font-heading font-bold mb-2"
      LeftSection={
        numObjects ? (
          <CountsIcon $count={numObjects}>
            {numObjects.toLocaleString()}
          </CountsIcon>
        ) : undefined
      }
      customPosition="bottom-start"
    />
  );

  return (
    <>
      <LoadingOverlay visible={isFetching} />
      <span>
        {numObjects === 0 ? (
          <Tooltip label={'Save a new cohort based on selection'}>
            <span>{dropDownIcon}</span>
          </Tooltip>
        ) : (
          <span>{dropDownIcon}</span>
        )}
      </span>

      <AddToExistingCohortModal
        opened={openSelectCohorts}
        index={index}
        objectTypename={objectTypename}
        objectIdField={objectIdField}
        lazyHook={useLazyGetObjectIdsQuery}
        onClose={() => setOpenSelectCohorts(false)}
        withOrWithoutCohort={withOrWithoutCohort}
        currentFilters={filters}
        onSaveCohort={(caseIds) => {
          openSaveCohortModal(caseIds);
          setOpenSelectCohorts(false);
        }}
      />
    </>
  );
};

export default CreateCohortFromFiltersButton;
