import React from "react";
import { MantineReactTable } from "mantine-react-table";
import type { MRT_ColumnDef } from "mantine-react-table";
import { JSONObject } from "@gen3/core";

export interface DiscoveryTableProps {
  readonly columns: Array<MRT_ColumnDef<JSONObject>>;
  readonly data: Array<JSONObject>;
}

const DiscoveryTable: React.FC<DiscoveryTableProps> = ({
  columns,
  data,
}: DiscoveryTableProps) => {
  return <MantineReactTable columns={columns} data={data} />;
};

export default DiscoveryTable;
