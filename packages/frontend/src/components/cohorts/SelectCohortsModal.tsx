import React, { useMemo, useState } from 'react';
import FunctionButton from '../../components/FunctionButton';
import DarkFunctionButton from '../../components/StyledComponents/DarkFunctionButton';
import { Loader, Modal, Radio, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { selectAvailableCohorts, useCoreSelector } from '@gen3/core';
import { COHORT_FILTER_INDEX } from '@/core';
import { HandleChangeInput } from '@/components/Table/types';
import { useLazyCohortCaseIdQuery } from '@/core/features/cases/caseSlice';

export type WithOrWithoutCohortType = 'with' | 'without' | undefined;

export const SelectCohortsModal = ({
  opened,
  onClose,
  withOrWithoutCohort,
  currentFilters,
  onSaveCohort,
}: {
  opened: boolean;
  onClose: () => void;
  withOrWithoutCohort: WithOrWithoutCohortType;
  currentFilters: any;
  onSaveCohort: (caseIds: ReadonlyArray<string>) => void;
}): JSX.Element => {
  const cohorts = useCoreSelector((state) => selectAvailableCohorts(state));
  const [checkedValue, setCheckedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchCaseIds] = useLazyCohortCaseIdQuery();

  const isWithCohort = withOrWithoutCohort === 'with';

  const cohortListData = useMemo(
    () =>
      cohorts
        ?.sort((a, b) => a.name.localeCompare(b.name))
        .map((cohort) => ({
          cohort_id: cohort?.id,
          cohort_filters: cohort?.filters,
          name: cohort?.name,
          num_cases: cohort?.counts?.case_centric?.toLocaleString(),
        })),
    [cohorts],
  );

  const cohortListTableColumnHelper =
    createColumnHelper<(typeof cohortListData)[0]>();

  const cohortListTableColumn = useMemo(
    () => [
      cohortListTableColumnHelper.display({
        id: 'select',
        header: 'Select',
        cell: ({ row }) => (
          <Radio
            data-testid={`radio-${row.original.name}`}
            value={row.original.cohort_id}
            checked={checkedValue === row.original.cohort_id}
            onChange={(event) => {
              setCheckedValue(event.currentTarget.value);
            }}
          />
        ),
      }),
      cohortListTableColumnHelper.accessor('name', {
        id: 'name',
        header: 'Name',
        cell: ({ getValue, row }) => (
          <span data-testid={`text-${row.original.name}-cohort-name`}>
            {getValue()}
          </span>
        ),
      }),
      cohortListTableColumnHelper.accessor('num_cases', {
        id: 'num_cases',
        header: '# Cases',
        cell: ({ getValue, row }) => (
          <span data-testid={`text-${row.original.name}-cohort-count`}>
            {getValue()}
          </span>
        ),
      }),
    ],
    [cohortListTableColumnHelper, checkedValue],
  );

  const getCaseIdsFromFilter = (
    filter: any,
    idField: string,
  ): ReadonlyArray<string> | null => {
    // Check if filter only contains object ids in the idField
    const rootKeys = Object.keys(filter?.root || {});
    if (
      rootKeys.length === 1 &&
      rootKeys[0] === idField &&
      filter.root[idField]?.operands
    ) {
      return filter.root[idField].operands;
    }
    return null;
  };

  const handleSubmit = async () => {
    if (loading || !checkedValue) return;

    setLoading(true);

    try {
      // Find the selected cohort
      const selectedCohort = cohortListData.find(
        (c) => c.cohort_id === checkedValue,
      );

      if (!selectedCohort?.cohort_filters) {
        console.error('No filters found for selected cohort');
        setLoading(false);
        return;
      }

      // Get current case IDs - either extract or fetch
      const directCurrentCaseIds = getCaseIdsFromFilter(currentFilters);

      const currentCaseIdsResult = directCurrentCaseIds
        ? directCurrentCaseIds
        : await fetchCaseIds({ filter: currentFilters }).unwrap();

      // Get cohort case IDs - either extract or fetch
      const cohortFilterSet =
        selectedCohort.cohort_filters[COHORT_FILTER_INDEX];
      const directCohortCaseIds = getCaseIdsFromFilter(cohortFilterSet);
      const cohortCaseIdsResult = directCohortCaseIds
        ? directCohortCaseIds
        : await fetchCaseIds({ filter: cohortFilterSet }).unwrap();

      let finalCaseIds: ReadonlyArray<string>;

      if (isWithCohort) {
        finalCaseIds = Array.from(
          new Set([...currentCaseIdsResult, ...cohortCaseIdsResult]),
        );
      } else {
        // "Without" - cohort cases minus current cases
        finalCaseIds = cohortCaseIdsResult.filter(
          (id) => !currentCaseIdsResult.includes(id),
        );
      }

      // Call the callback to open SaveCohortModal with final case IDs
      onSaveCohort(finalCaseIds);
    } catch (error) {
      console.error('Error processing cohorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (obj: HandleChangeInput) => {
    switch (Object.keys(obj)?.[0]) {
      case 'newPageNumber':
        handlePageChange(obj.newPageNumber as number); // TODO: probably need to double check this
        break;
      case 'newPageSize':
        handlePageSizeChange(obj.newPageSize as string); // TODO: probably need to double check this
        break;
    }
  };

  const title = `save new cohort: existing cohort ${
    isWithCohort ? 'with' : 'without'
  } selected cases`;

  const description = `Select an existing cohort, then click Submit. This will save a new
    cohort that contains all the cases from your selected cohort ${
      isWithCohort ? 'and' : 'except'
    } the cases previously selected.`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton
      title={title}
      classNames={{
        content: 'p-0 drop-shadow-lg',
        body: 'flex flex-col justify-between min-h-[300px]',
      }}
      size="xl"
      zIndex={400}
    >
      <div className="px-4">
        <Text className="text-sm mb-4 block font-content">{description}</Text>

        <VerticalTable
          customDataTestID="table-select-cohort"
          data={displayedData}
          columns={cohortListTableColumn}
          status="fulfilled"
          pagination={{
            page,
            pages,
            size,
            from,
            total,
            label: 'cohort',
          }}
          handleChange={handleChange}
        />
      </div>
      <div
        data-testid="modal-button-container"
        className="bg-base-lightest flex p-4 gap-4 justify-end mt-4 rounded-b-lg sticky"
      >
        <FunctionButton data-testid="button-cancel" onClick={onClose}>
          Cancel
        </FunctionButton>
        <DarkFunctionButton
          data-testid="button-submit"
          disabled={!checkedValue}
          loading={loading}
          leftSection={loading ? <Loader size={15} color="white" /> : undefined}
          onClick={handleSubmit}
        >
          Submit
        </DarkFunctionButton>
      </div>
    </Modal>
  );
};
