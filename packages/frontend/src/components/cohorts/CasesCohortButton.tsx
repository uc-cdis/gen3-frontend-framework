import React, { useState } from 'react';
import { modals } from '@mantine/modals';
import { DropdownWithIcon } from '../DropdownWithIcon/DropdownWithIcon';
import { CountsIcon } from '../tailwindComponents';
import { LoadingOverlay, Tooltip } from '@mantine/core';
import {
  SelectCohortsModal,
  WithOrWithoutCohortType,
} from './SelectCohortsModal';
import { IndexedFilterSet, Operation } from '@gen3/core';

type GetObjectIdsFunction = (filter: IndexedFilterSet) => ReadonlyArray<string>;

type GetUniqueIdsLazyHook = () => [GetObjectIdsFunction, any];

interface CasesCohortButtonProps {
  filters: IndexedFilterSet;
  cohortFilterTemplate?: Record<string, Operation>;
  counts: number;
  hook: GetUniqueIdsLazyHook;
}

export const CasesCohortButton: React.FC<CasesCohortButtonProps> = ({
  filters,
  cohortFilterTemplate = {
    object_id: {
      operator: 'in',
      field: 'object_id',
      operands: [],
    },
  },
  counts,
  hook,
}: CasesCohortButtonProps) => {
  const [openSelectCohorts, setOpenSelectCohorts] = useState(false);
  const [withOrWithoutCohort, setWithOrWithoutCohort] =
    useState<WithOrWithoutCohortType>(undefined);
  const [fetchCaseIds, { isFetching }] = hook();

  const openSaveCohortModal = (objectIds: ReadonlyArray<string>) => {
    const cohortFilters = {
      ...cohortFilterTemplate,
    };

    modals.openContextModal({
      modal: 'saveCohortModal',
      title: 'Save Cohort',
      size: 'md',
      zIndex: 1200,
      styles: {
        header: {
          marginLeft: '16px',
        },
      },
      innerProps: {
        filters: {
          [COHORT_FILTER_INDEX]: cohortFilters,
        },
      },
    });
  };

  // can reuse also in SelectCohortsModal right now
  const getCaseIdsFromFilter = (filter: any): ReadonlyArray<string> | null => {
    // Check if filter only contains cases.case_id
    const rootKeys = Object.keys(filter?.root || {});
    if (
      rootKeys.length === 1 &&
      rootKeys[0] === 'cases.case_id' &&
      filter.root['cases.case_id']?.operands
    ) {
      return filter.root['cases.case_id'].operands;
    }
    return null;
  };

  const handleSaveOnlySelectedCases = async () => {
    if (counts < 1) return;

    try {
      // Check if we can extract case IDs directly
      const directCaseIds = getCaseIdsFromFilter(filters);

      if (directCaseIds) {
        // Use extracted IDs directly
        openSaveCohortModal(directCaseIds);
      } else {
        // Fetch case IDs from current filters
        const result = await fetchCaseIds({ filter: filters }).unwrap();
        openSaveCohortModal(result);
      }
    } catch (error) {
      console.error('Error fetching case IDs:', error);
    }
  };

  const dropDownIcon = (
    <DropdownWithIcon
      customTargetButtonDataTestId="button-save-new-cohort-cases-table"
      dropdownElements={[
        {
          title: 'Only Selected Cases',
          onClick: handleSaveOnlySelectedCases,
        },
        {
          title: 'Existing Cohort With Selected Cases',
          onClick: () => {
            setWithOrWithoutCohort('with');
            setOpenSelectCohorts(true);
          },
        },
        {
          title: 'Existing Cohort Without Selected Cases',
          onClick: () => {
            setWithOrWithoutCohort('without');
            setOpenSelectCohorts(true);
          },
        },
      ]}
      TargetButtonChildren="Save New Cohort"
      targetButtonTooltip="Save a new cohort based on selection"
      disableTargetWidth={true}
      targetButtonDisabled={counts === 0}
      menuLabelText={`${counts.toLocaleString()}
        ${counts > 1 ? ' Cases' : ' Case'}`}
      menuLabelCustomClass="bg-primary text-primary-contrast font-heading font-bold mb-2"
      LeftSection={
        counts ? (
          <CountsIcon $count={counts}>{counts.toLocaleString()}</CountsIcon>
        ) : undefined
      }
      customPosition="bottom-start"
    />
  );

  return (
    <>
      <LoadingOverlay visible={isFetching} />
      <span>
        {counts === 0 ? (
          <Tooltip label={'Save a new cohort based on selection'}>
            <span>{dropDownIcon}</span>
          </Tooltip>
        ) : (
          <span>{dropDownIcon}</span>
        )}
      </span>

      <SelectCohortsModal
        opened={openSelectCohorts}
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

interface CasesCohortButtonFromFilters {
  filters: IndexedFilterSet;
  cohortFilterTemplate?: Record<string, Operation>;
  counts: number;
  hook: GetUniqueIdsLazyHook;
}

export const CasesCohortButtonFromFilters: React.FC<
  CasesCohortButtonFromFilters
> = (props: CasesCohortButtonFromFilters) => {
  return <CasesCohortButton {...props} />;
};
