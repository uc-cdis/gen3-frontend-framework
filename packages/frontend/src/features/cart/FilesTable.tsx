import React from 'react';
import { ExplorerTableProps } from '../CohortBuilder/ExplorerTable';
import { ExplorerTable } from '../CohortBuilder';

type FilesTableProps = Omit<
  ExplorerTableProps,
  'index' | 'indexPrefix' | 'dataHook'
>;

const FilesTable = ({ tableConfig }: FilesTableProps) => {
  return <ExplorerTable tableConfig={tableConfig} />;
};

export default FilesTable;
