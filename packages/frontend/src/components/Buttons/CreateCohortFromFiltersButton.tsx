import React, { useState } from 'react';
import { LoadingOverlay, Tooltip } from '@mantine/core';
import { FilterSet, useLazyGetObjectIdsQuery } from '@gen3/core';
import { WithOrWithoutCohortType } from '../../features/ClinicalDataAnalysis/CDaveCard/types';
import AddToExistingCohortModal from '../../features/ClinicalDataAnalysis/CDaveCard/AddToExistingCohortModal';
import { modals } from '@mantine/modals';
import { getObjectIdsFromFilter } from '../../features/ClinicalDataAnalysis/CDaveCard/utils';
import { DropdownWithIcon } from '../DropdownWithIcon/DropdownWithIcon';
import { CountsIcon } from '../tailwindComponents';
import { labelToPlural } from '../../utils/labels';

interface CreateCohortFromFiltersButtonProps {
  filters: FilterSet;
  numObjects: number;
  index: string;
  uniqueIdField: string;
  dataTypename: string;
}

const CreateCohortFromFiltersButton = ({
  filters,
  numObjects,
  index,
  uniqueIdField,
  dataTypename,
}: CreateCohortFromFiltersButtonProps) => {
  const [openSelectCohorts, setOpenSelectCohorts] = useState(false);
  const [withOrWithoutCohort, setWithOrWithoutCohort] =
    useState<WithOrWithoutCohortType>(undefined);
  const [fetchIds, { isFetching }] = useLazyGetObjectIdsQuery();

  const openSaveCohortModal = (caseIds: ReadonlyArray<string>) => {
    const cohortFilters = {
      mode: 'and',
      root: {
        [uniqueIdField]: {
          operator: 'in',
          field: uniqueIdField,
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
      const directCaseIds = getObjectIdsFromFilter(filters, uniqueIdField);

      if (directCaseIds) {
        // Use extracted IDs directly
        openSaveCohortModal(directCaseIds);
      } else {
        // Fetch case IDs from current filters
        const result = await fetchIds({
          filters: filters,
          field: uniqueIdField,
          index: index,
        }).unwrap();
        openSaveCohortModal(result?.ids ?? ([] as ReadonlyArray<string>));
      }
    } catch (error) {
      console.error('Error fetching case IDs:', error);
    }
  };

  const unitLabel = labelToPlural(dataTypename);

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
        ${numObjects != 1 ? labelToPlural(dataTypename) : dataTypename}`}
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
        dataTypename={dataTypename}
        uniqueIdField={uniqueIdField}
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
