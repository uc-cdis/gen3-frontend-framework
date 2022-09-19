import React from 'react';
import SimpleTable, { StyledColumn } from '../Tables/SimpleTable';

export interface DiscoveryTableProps {
  readonly columns: ReadonlyArray<StyledColumn>;
  readonly data: ReadonlyArray<Record<string, any>>
}

const DiscoveryTable: React.FC<DiscoveryTableProps> = ({columns, data} : DiscoveryTableProps) => {
  return (
    <SimpleTable columns={columns} data={data} />
  );
};

export default DiscoveryTable;
