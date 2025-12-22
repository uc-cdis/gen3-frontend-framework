import React, { useMemo } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  Accessibility,
  CoreState,
  FilterSet,
  selectIndexFilters,
  useCoreSelector,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import {
  type MRT_PaginationState,
  type MRT_SortingState,
} from 'mantine-react-table';
import { ExplorerTableProps, SimplifiedExplorerDataHook } from './types';
import { type TableDetailsPanelProps } from './ExploreTableDetails';
import { DetailsDrawer, DetailsModal } from '../../../components/Details';
import { createTableColumns } from './utils';
import QueryRowDetailsPanel from './ExploreTableDetails/QueryRowDetailsPanel';
import { DetailsComponentProps } from '../../../components/Details/types';
import { ExplorerDataTable } from './ExplorerDataTable';

export const DEFAULT_PAGE_LIMIT_LABEL = 'Rows per Page (Limited to 10,0000):';
export const DEFAULT_PAGE_LIMIT = 10000;

const DefaultDataResponse = {
  id: 'no-data',
  name: 'No Data',
  description: 'No Data',
};

// ... existing code ...
const useGetTableData = (
  index: string,
  fields: string[],
  filters: FilterSet,
  pagination: MRT_PaginationState,
  sorting: MRT_SortingState,
  accessibility: Accessibility,
  maxItems?: number,
  indexPrefix: string = '',
) => {
  const { pageIndex, pageSize } = pagination;

  const sort =
    sorting.length > 0
      ? (sorting.map((s) => ({ [s.id]: s.desc ? 'desc' : 'asc' })) as Record<
          string,
          'desc' | 'asc'
        >[])
      : undefined;

  const { data, isLoading, isError, isFetching, isSuccess } =
    useGetRawDataAndTotalCountsQuery({
      type: index,
      fields,
      filters,
      offset: pageIndex * pageSize,
      size: pageSize,
      sort,
      accessibility,
      indexPrefix,
    });

  const totalRowCount = useDeepCompareMemo(() => {
    const aggregationKey = `${indexPrefix}_aggregation`;
    const fetchedTotal =
      data?.data?.[aggregationKey]?.[index]?._totalCount ?? pageSize;
    const pageLimit = maxItems ?? DEFAULT_PAGE_LIMIT;

    return pageLimit ? Math.min(pageLimit, fetchedTotal) : fetchedTotal;
  }, [maxItems, data, pageSize, index, indexPrefix]);

  return {
    data: data?.data?.[`${indexPrefix}${index}`] ?? [
      {
        id: 'no-data',
        name: 'No Data',
        description: 'No Data',
      },
    ],
    totalRowCount,
    isLoading,
    isError,
    isFetching,
    isSuccess,
  };
};

const ExplorerTable = ({
  index,
  tableConfig,
  accessibility,
  classNames,
  size = 'sm',
  additionalControls,
  tableTotalDetail,
  tableTitle,
  indexPrefix = '',
  dataHook = useGetRawDataAndTotalCountsQuery,
}: ExplorerTableProps) => {
  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const { tableColumns } = useDeepCompareMemo(() => {
    return createTableColumns(tableConfig);
  }, [tableConfig]);

  const fields = useMemo(
    () => tableColumns.map((column) => column.field),
    [tableColumns],
  );

  const DetailsPanel = useMemo(() => QueryRowDetailsPanel, []);

  const DetailsComponentWrapper = useMemo(() => {
    if (
      !tableConfig?.detailsConfig ||
      !tableConfig?.detailsConfig?.panel ||
      tableConfig?.detailsConfig?.mode === 'none'
    )
      return null;

    const BaseComponent =
      tableConfig?.detailsConfig?.panelContainer === 'drawer'
        ? DetailsDrawer<TableDetailsPanelProps>
        : DetailsModal<TableDetailsPanelProps>;

    const WrappedDetailsComponent = ({
      id,
      row,
      onClose,
    }: Pick<DetailsComponentProps, 'id' | 'row' | 'onClose'>) => (
      <BaseComponent
        title={tableConfig?.detailsConfig?.title}
        id={id}
        row={row}
        onClose={onClose}
        panel={DetailsPanel}
        classNames={tableConfig?.detailsConfig?.classNames}
        panelProps={{
          index,
          tableConfig,
          ...(tableConfig?.detailsConfig?.params ?? {}),
          accessibility,
        }}
      />
    );
    WrappedDetailsComponent.displayName = 'WrappedDetailsComponent';
    return WrappedDetailsComponent;
  }, [tableConfig, index, accessibility, DetailsPanel]);

  const useSimplifiedData: SimplifiedExplorerDataHook = ({
    pagination,
    sorting,
    accessibility,
  }) => {
    const { pageIndex, pageSize } = pagination;
    const sort = useMemo(
      () =>
        sorting.length > 0
          ? (sorting.map((x) => ({
              [x.id]: x.desc ? 'desc' : 'asc',
            })) as Record<string, 'desc' | 'asc'>[])
          : undefined,
      [sorting],
    );

    const { data, isLoading, isError, isFetching, isSuccess } = dataHook({
      type: index,
      fields: fields,
      filters: cohortFilters,
      offset: pageIndex * pageSize,
      size: pageSize,
      sort,
      accessibility,
      indexPrefix: indexPrefix,
    });

    const { totalRowCount, limitLabel } = useDeepCompareMemo(() => {
      const pageLimit = tableConfig?.pageLimit?.limit ?? DEFAULT_PAGE_LIMIT;
      const aggregationKey = `${indexPrefix}_aggregation`;
      const fetchedTotal =
        data?.data?.[aggregationKey]?.[index]?._totalCount ?? pageSize;

      const totalCount = tableConfig?.pageLimit
        ? Math.min(pageLimit, fetchedTotal)
        : fetchedTotal;

      const label = tableConfig?.pageLimit
        ? (tableConfig?.pageLimit?.label ?? DEFAULT_PAGE_LIMIT_LABEL)
        : 'Rows per Page:';

      return { totalRowCount: totalCount, limitLabel: label };
    }, [data, pageSize]);

    const tableData = useMemo(() => {
      return data?.data?.[`${indexPrefix}${index}`] ?? [DefaultDataResponse];
    }, [data]);

    return {
      data: tableData,
      totalRowCount,
      limitLabel,
      isLoading,
      isError,
      isFetching,
      isSuccess,
    };
  };

  return (
    <ExplorerDataTable
      tableConfig={tableConfig}
      accessibility={accessibility}
      classNames={classNames}
      size={size}
      additionalControls={additionalControls}
      tableTotalDetail={tableTotalDetail}
      DetailsComponent={DetailsComponentWrapper}
      tableTitle={tableTitle}
      dataHook={useSimplifiedData}
    />
  );
};

export default ExplorerTable;
