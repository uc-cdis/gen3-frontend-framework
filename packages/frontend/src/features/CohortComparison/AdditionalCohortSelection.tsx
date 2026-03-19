import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip } from '@mantine/core';
import {
  Cohort,
  selectAvailableCohorts,
  selectCurrentCohort,
  useCoreSelector,
} from '@gen3/core';
import FunctionButton from '../../components/FunctionButton';
import DarkFunctionButton from '../../components/StyledComponents/DarkFunctionButton';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_RowSelectionState,
  useMantineReactTable,
} from 'mantine-react-table';
import { labelToPlural } from '../../utils/labels';

interface AdditionalCohortSelectionProps {
  readonly setOpen: (open: boolean) => void;
  readonly setActiveApp: (id?: string, demoMode?: boolean) => void;
  readonly setComparisonCohort: (cohort?: Cohort) => void;
  readonly index: string;
  readonly dataTypename: string;
}

const AdditionalCohortSelection: React.FC<AdditionalCohortSelectionProps> = ({
  setOpen,
  setComparisonCohort,
  index,
  dataTypename,
}: AdditionalCohortSelectionProps) => {
  const primaryCohort = useCoreSelector((state) => selectCurrentCohort(state));
  const availableCohorts = useCoreSelector((state) =>
    selectAvailableCohorts(state),
  );

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const cohorts = useDeepCompareMemo(
    () => availableCohorts.filter((cohort) => cohort.id !== primaryCohort.id),
    [primaryCohort, availableCohorts],
  );

  const [selectedCohort, setSelectedCohort] = useState<Cohort | undefined>();

  useEffect(() => {
    //do something when the row selection changes...
    console.info({ rowSelection });
  }, [rowSelection]);

  const cohortListTableColumns = useMemo(
    () =>
      [
        {
          accessorKey: 'select',
          header: 'Select',
          Cell: ({ row }) => {
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
        },
        {
          accessorKey: 'name',
          header: 'Name',
          Cell: ({ row }) => (
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
        },
        {
          accessorKey: 'count',
          header: `# ${labelToPlural(dataTypename)}`,
          Cell: ({ row }) => (
            <span
              data-testid={`text-${row.original.name}-case-count-cohort-comparison`}
              className={
                !row.original?.counts?.[index] ? 'text-base-lighter' : undefined
              }
            >
              {row.original?.counts?.[index]?.toLocaleString()}
            </span>
          ),
        },
      ] as MRT_ColumnDef<Cohort>[],
    [index, selectedCohort?.id],
  );

  const table = useMantineReactTable<Cohort>({
    columns: cohortListTableColumns,
    data: cohorts,
    manualSorting: true,
    manualPagination: false,
    paginateExpandedRows: false,
    rowCount: cohorts.length,
    enableTopToolbar: false,
    layoutMode: 'semantic',
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    mantineTableHeadCellProps: {
      style: {
        backgroundColor: 'var(--mantine-color-secondary-8)',
        color: 'var(--mantine-color-table-0)',
        textAlign: 'center',
        padding: 'var(--mantine-spacing-md)',
        fontWeight: 'bold',
        fontSize: 'var(--mantine-font-size-lg)',
        textTransform: 'uppercase',
      },
    },
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-9)',
      },
    },
  });

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

        <MantineReactTable table={table} />
      </div>
      <div className="flex flex-row justify-end w-full sticky bottom-0 bg-base-lightest py-2 px-4">
        <FunctionButton
          data-testid="button-cancel-cohort-comparison"
          className="mr-4"
          onClick={() => {
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
