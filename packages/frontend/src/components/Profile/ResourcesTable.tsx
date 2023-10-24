import React, { useMemo } from 'react';
import { type ServiceAndMethod } from '@gen3/core';

import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_Cell,
  useMantineReactTable,
} from 'mantine-react-table';
import { useResourcesContext } from './ResourcesProvider';

interface ItemResource {
  resource: string;
  methods: Record<string, string[]>;
}

const convertToRecordMethodToResource = (entries: ServiceAndMethod[]) => {
  return entries.reduce(
    (acc: Record<string, string[]>, entry: ServiceAndMethod) => {
      if (!(entry.method in acc)) {
        acc[entry.method] = [entry.service];
      } else acc[entry.method].push(entry.service);
      return acc;
    },
    {} as Record<string, string[]>,
  );
};

const ResourcesTable = () => {
  const { userProfile, servicesAndMethods } = useResourcesContext();

  let rows :ItemResource[] = [];

  if (userProfile && userProfile?.authz) {

    rows = Object.keys(userProfile.authz).map((key) => {
      const authz = userProfile?.authz?.[key] ?? {} as ServiceAndMethod[];
      const methods = convertToRecordMethodToResource(authz);
      return {
        resource: key,
        methods: methods,
      };
    }) as ItemResource[];
  }

  const columns = useMemo(() => {
    return [
      {
        header: 'Resource',
        accessorKey: 'resource',
       Cell: ({ row }: MRT_Cell<ItemResource>) => (
          <div>
            {row.original.resource}
          </div>
        )

      },
      ...servicesAndMethods.methods.map((method) => {
        return {
          header: method,
          accessor: 'methods',
          Cell: ({ row }: MRT_Cell<ItemResource>) => (
            <div>
              {row.original.methods[method].map((resource) => {
                return <span key={method}>{resource}</span>;
              })}
            </div>
          ),
        };
      }),
    ] as unknown as  MRT_ColumnDef<ItemResource>[];
  }, [servicesAndMethods.methods]);

  const table = useMantineReactTable<ItemResource>({
    columns,
    data: rows,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
  });

  return (<div className="w-full">
    <MantineReactTable table={table} />;
  </div>);
};

export default ResourcesTable;
