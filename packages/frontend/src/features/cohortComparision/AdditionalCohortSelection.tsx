import React, { useMemo, useState } from 'react';
import { Tooltip } from '@mantine/core';
import {
  Cohort,
  selectAvailableCohorts,
  selectCurrentCohort,
  useCoreSelector,
} from '@gen3/core';
import useStandardPagination from '@/hooks/useStandardPagination';
import FunctionButton from '@/components/FunctionButton';
import DarkFunctionButton from '@/components/StyledComponents/DarkFunctionButton';
import { createColumnHelper } from '@tanstack/react-table';
import { HandleChangeInput } from '@/components/Table/types';
import { useDeepCompareMemo } from 'use-deep-compare';

interface AdditionalCohortSelectionProps {
  readonly app?: string;
  readonly setActiveApp: (id?: string, demoMode?: boolean) => void;
  readonly setOpen: (open: boolean) => void;
  readonly setComparisonCohort: (cohort?: Cohort) => void;
  readonly index: string;
}

const AdditionalCohortSelection: React.FC<AdditionalCohortSelectionProps> = ({
  setActiveApp,
  setOpen,
  setComparisonCohort,
  index,
}: AdditionalCohortSelectionProps) => {
  const primaryCohort = useCoreSelector((state) => selectCurrentCohort(state));
  const availableCohorts = useCoreSelector((state) =>
    selectAvailableCohorts(state),
  );

  const cohorts = useDeepCompareMemo(
    () => availableCohorts.filter((cohort) => cohort.id !== primaryCohort.id),
    [primaryCohort, availableCohorts],
  );

  const [selectedCohort, setSelectedCohort] = useState<Cohort | undefined>();

  const cohortListTableColumnHelper = createColumnHelper<(typeof cohorts)[0]>();

  const cohortListTableColumns = useMemo(
    () => [
      cohortListTableColumnHelper.display({
        id: 'select',
        header: 'Select',
        cell: ({ row }) => {
          const counts = row.original?.counts?.[index];
          const disabled = !(counts && counts > 0);

          return (
            <Tooltip
              label="Cohort is empty"
              disabled={!disabled}
              position="right"
            >
              <input
                data-testid={`button-${row.original.name}-cohort-comparison`}
                type="radio"
                name="additional-cohort-selection"
                id={row.original.id}
                onChange={() => setSelectedCohort(row.original)}
                checked={selectedCohort?.id === row.original.id}
                // autoFocus fixes keyboard nav losing focus when setSelectedCohort is used
                autoFocus={selectedCohort?.id === row.original.id}
                disabled={disabled}
                className={!counts ? 'cursor-not-allowed' : undefined}
              />
            </Tooltip>
          );
        },
      }),
      cohortListTableColumnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <label
            data-testid="text-cohort-name-cohort-comparison"
            htmlFor={row.original.id}
            className={
              !row.original?.counts?.[index] ? 'text-base-lighter' : undefined
            }
          >
            {row.original.name}
          </label>
        ),
      }),
      cohortListTableColumnHelper.display({
        id: 'count',
        header: '# Cases',
        cell: ({ row }) => (
          <span
            data-testid={`text-${row.original.name}-case-count-cohort-comparison`}
            className={
              !row.original?.counts?.[index] ? 'text-base-lighter' : undefined
            }
          >
            {row.original?.counts?.[index]?.toLocaleString()}
          </span>
        ),
      }),
    ],
    [cohortListTableColumnHelper, selectedCohort?.id],
  );

  const {
    handlePageChange,
    handlePageSizeChange,
    page,
    pages,
    size,
    from,
    total,
    displayedData,
  } = useStandardPagination(cohorts);

  const handleChange = (obj: HandleChangeInput) => {
    switch (Object.keys(obj)?.[0]) {
      case 'newPageSize':
        if (obj.newPageSize) handlePageSizeChange(obj.newPageSize);
        break;
      case 'newPageNumber':
        if (obj.newPageNumber) handlePageChange(obj.newPageNumber);
        break;
    }
  };

  return (
    <div className="bg-base-max">
      <div className="p-4 w-full xl:w-3/4">
        <h2 className="font-heading text-lg font-bold py-2 text-primary-content-darkest">
          Select a cohort to compare with {primaryCohort.name}
        </h2>
        <p className="font-content pb-2">
          Display the survival analysis of your cohorts and compare
          characteristics such as gender, vital status and age at diagnosis.
          Create cohorts in the Analysis Center.
        </p>
        <VerticalTable
          data={displayedData}
          columns={cohortListTableColumns}
          pagination={{
            page,
            pages,
            size,
            from,
            total,
            label: 'cohort',
          }}
          status="fulfilled"
          handleChange={handleChange}
        />
      </div>
      <div className="flex flex-row justify-end w-full sticky bottom-0 bg-base-lightest py-2 px-4">
        <FunctionButton
          data-testid="button-cancel-cohort-comparison"
          className="mr-4"
          onClick={() => {
            if (setActiveApp) setActiveApp(undefined);
            setOpen(false);
          }}
        >
          Cancel
        </FunctionButton>
        <DarkFunctionButton
          data-testid="button-run-cohort-comparison"
          disabled={selectedCohort === undefined}
          onClick={() => {
            setOpen(false);
            setComparisonCohort(selectedCohort);
          }}
        >
          Run
        </DarkFunctionButton>
      </div>
    </div>
  );
};

export default AdditionalCohortSelection;
