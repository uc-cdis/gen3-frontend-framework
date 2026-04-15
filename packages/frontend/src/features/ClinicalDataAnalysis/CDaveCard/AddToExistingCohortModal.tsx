import React, { useMemo, useState } from 'react';
import FunctionButton from '../../../components/FunctionButton';
import DarkFunctionButton from '../../../components/StyledComponents/DarkFunctionButton';
import { Loader, Modal, Radio, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import {
  Accessibility,
  Cohort,
  FilterSet,
  IndexedFilterSet,
  selectAvailableCohorts,
  useCoreSelector,
} from '@gen3/core';
import {
  MantineReactTable,
  type MRT_PaginationState,
  type MRT_Row,
  useMantineReactTable,
} from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';
import { getObjectIdsFromFilter } from './utils';
import { LazyQueryHookResult } from './types';

export type WithOrWithoutCohortType = 'with' | 'without' | undefined;

interface ObjectIdQueryRequest {
  filters: FilterSet;
  field: string;
  index: string;
  indexPrefix?: string;
  accessibility?: Accessibility;
}

interface ObjectIdQueryResponse {
  ids: string[];
  index: string;
}

interface CohortListData {
  id: string;
  filters: IndexedFilterSet;
  name: string;
  numItems: string;
}

type ObjectIdLazyQueryHook = () => LazyQueryHookResult<
  ObjectIdQueryRequest,
  ObjectIdQueryResponse
>;

interface AddToExistingCohortModalProps {
  opened: boolean;
  onClose: () => void;
  withOrWithoutCohort: WithOrWithoutCohortType;
  index: string;
  lazyHook: ObjectIdLazyQueryHook;
  currentFilters: any;
  uniqueIdField: string;
  dataTypename: string;
  onSaveCohort: (objectIds: ReadonlyArray<string>) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AddToExistingCohortModal = ({
  opened,
  onClose,
  withOrWithoutCohort,
  currentFilters,
  onSaveCohort,
  uniqueIdField,
  index,
  dataTypename,
  lazyHook,
  size = 'sm',
}: AddToExistingCohortModalProps) => {
  const cohorts = useCoreSelector((state) => selectAvailableCohorts(state));
  const [checkedValue, setCheckedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchObjectIds, { isFetching, isError }] = lazyHook();

  const isWithCohort = withOrWithoutCohort === 'with';

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const cohortListData = useMemo<CohortListData[]>(
    () =>
      cohorts
        ?.sort((a: Cohort, b: Cohort) => a.name.localeCompare(b.name))
        .map((cohort: Cohort) => ({
          id: cohort?.id,
          filters: cohort?.filters,
          name: cohort?.name,
          numItems: cohort?.counts?.[index]?.toLocaleString() ?? '0',
        })),
    [cohorts],
  );

  const cohortListTableColumnHelper =
    createColumnHelper<(typeof cohortListData)[0]>();

  const cohortListTableColumn = useMemo(
    () => [
      {
        id: 'select',
        header: 'Select',
        accessorKey: 'id',
        Cell: ({ row }: { row: MRT_Row<CohortListData> }) => (
          <Radio
            data-testid={`radio-${row.original.name}`}
            value={row.original.id}
            checked={checkedValue === row.original.id}
            onChange={(event) => {
              setCheckedValue(event.currentTarget.value);
            }}
          />
        ),
      },
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
      },
      {
        id: 'numItems',
        header: `# ${dataTypename}`,
        accessorKey: 'numItems',
      },
    ],
    [cohortListTableColumnHelper, checkedValue],
  );

  const handleSubmit = async () => {
    if (loading || !checkedValue) return;

    setLoading(true);

    try {
      // Find the selected cohort
      const selectedCohort = cohortListData.find((c) => c.id === checkedValue);

      if (!selectedCohort?.filters) {
        console.error('No filters found for selected cohort');
        setLoading(false);
        return;
      }

      // Get current case IDs - either extract or fetch
      const directCurrentObjectIds = getObjectIdsFromFilter(
        currentFilters,
        uniqueIdField,
      );

      let currentIdsResult;
      if (directCurrentObjectIds) currentIdsResult = directCurrentObjectIds;
      else {
        const r = await fetchObjectIds({
          index: index,
          filters: currentFilters,
          field: uniqueIdField,
        }).unwrap();
        currentIdsResult = r?.ids ?? ([] as ReadonlyArray<string>);
      }

      // Get cohort case IDs - either extract or fetch
      const cohortFilterSet = selectedCohort.filters[index];
      const directCohortObjectIds = getObjectIdsFromFilter(
        cohortFilterSet,
        uniqueIdField,
      );
      let cohortIdsResult;
      if (directCohortObjectIds) cohortIdsResult = directCohortObjectIds;
      else {
        const r = await fetchObjectIds({
          index: index,
          filters: cohortFilterSet,
          field: uniqueIdField,
        }).unwrap();
        cohortIdsResult = r?.ids ?? ([] as ReadonlyArray<string>);
      }

      let finalCaseIds: ReadonlyArray<string>;

      if (isWithCohort) {
        finalCaseIds = Array.from(
          new Set([...currentIdsResult, ...cohortIdsResult]),
        );
      } else {
        // "Without" - cohort cases minus current cases
        finalCaseIds = cohortIdsResult.filter(
          (id) => !currentIdsResult.includes(id),
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

  const title = `Save new cohort: existing cohort ${
    isWithCohort ? 'with' : 'without'
  } selected cases`;

  const description = `Select an existing cohort, then click Submit. This will save a new
    cohort that contains all the cases from your selected cohort ${
      isWithCohort ? 'and' : 'except'
    } the cases previously selected.`;

  const table = useMantineReactTable<CohortListData>({
    data: cohortListData,
    columns: cohortListTableColumn,
    manualSorting: true,
    manualPagination: true,
    enableStickyHeader: true,
    enableColumnFilters: false,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    enableTopToolbar: false,
    enableExpandAll: false,
    enableHiding: true,
    //enableColumnOrdering: tableConfig?.columnSorting,
    // enableHiding: tableConfig?.columnHiding,
    rowCount: cohorts.length,
    icons: TableIcons,
    paginationDisplayMode: 'pages',
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-1)',
        '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
        fontSize: `var(--mantine-font-size-${size})`,
        zIndex: 10,
      },
    },
    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '20', '40', '100'],
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
    },

    mantineTableHeadCellProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-table-1)',
        color: `var(--mantine-color-table-contrast-5')`,
      },
    },
    state: {
      isLoading: isFetching,
      pagination,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      density: 'xs',
      columnOrder: [
        'mrt-row-expand',
        'mrt-row-number',
        'mrt-row-selection',
        'mrt-row-actions',
      ],
    },
  });

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
      </div>
      <MantineReactTable table={table} />
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

export default AddToExistingCohortModal;
