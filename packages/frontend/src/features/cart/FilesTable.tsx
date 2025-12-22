import React from 'react';
import {
  ExplorerDataTableHookProps,
  ExplorerTableProps,
} from '../CohortBuilder/ExplorerTable';
import { ExplorerDataTable } from '../CohortBuilder/ExplorerTable/ExplorerDataTable';
import { Accessibility } from '@gen3/core';

type FilesTableProps = Omit<
  ExplorerTableProps,
  'index' | 'indexPrefix' | 'dataHook'
>;

const FilesTable = ({ tableConfig }: FilesTableProps) => {
  const useCartDataHook = ({
    pagination,
    sorting,
    accessibility,
  }: ExplorerDataTableHookProps) => {
    return {
      isSuccess: true,
      isLoading: false,
      isFetching: false,
      isError: false,
      data: [],
      totalRowCount: 0,
      limitLabel: '',
    };
  };

  return (
    <ExplorerDataTable
      tableConfig={tableConfig}
      accessibility={Accessibility.ALL}
      dataHook={useCartDataHook}
    />
  );
};

export default FilesTable;
