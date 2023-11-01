import React, { useMemo } from 'react';
import { type ServiceAndMethod } from '@gen3/core';
import { Badge } from '@mantine/core';

import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_Cell,
  useMantineReactTable,
} from 'mantine-react-table';
import { useResourcesContext } from './ResourcesProvider';
import { useProfileContext } from './ProfileProvider';
import { ServiceColorAndLabel } from './types';

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

interface ResourceBadgeProps {
  resource: string;
  serviceBadgeStyle: Record<string, ServiceColorAndLabel>;
  defaultColor?: string;
}

const ResourceBadge = ({
  resource,
  serviceBadgeStyle,
  defaultColor = 'primary',
}: ResourceBadgeProps): JSX.Element => {
  const { color, label } =
    resource in serviceBadgeStyle
      ? serviceBadgeStyle[resource]
      : { color: defaultColor, label: resource };

  return (
    <Badge variant="filled" fullWidth color={color}>
      {label}
    </Badge>
  );
};

const ResourcesTable = () => {
  const { userProfile, servicesAndMethods } = useResourcesContext();
  const { profileConfig } = useProfileContext();

  let rows: ItemResource[] = [];

  rows = useMemo(
    () =>
      Object.keys(userProfile?.authz ?? {}).map((key) => {
        const authz = userProfile?.authz?.[key] ?? ({} as ServiceAndMethod[]);
        const methods = convertToRecordMethodToResource(authz);
        return {
          resource: key,
          methods: methods,
        };
      }),
    [userProfile?.authz],
  );

  const columns = useMemo(() => {
    return [
      {
        header: 'Resource',
        accessorKey: 'resource',
        size: 500,
        Cell: ({ row }: MRT_Cell<ItemResource>) => (
          <div>{row.original.resource}</div>
        ),
      },
      ...servicesAndMethods.methods.map((method) => {
        return {
          header: method,
          accessor: 'methods',
          size: 150,
          Cell: ({ row }: MRT_Cell<ItemResource>) => {
            return (
              <div className="flex flex-col space-y-1 bg-base-light">
                {method in row.original.methods ? (
                  row.original.methods[method].map((resource) => (
                    <ResourceBadge
                      key={resource}
                      resource={resource}
                      serviceBadgeStyle={
                        profileConfig.resourceTable?.serviceColors ?? {}
                      }
                    />
                  ))
                ) : (
                  <span className="w-4 h-4"></span>
                )}
              </div>
            );
          },
        };
      }),
    ] as unknown as MRT_ColumnDef<ItemResource>[];
  }, [servicesAndMethods.methods]);

  const table = useMantineReactTable<ItemResource>({
    columns,
    data: rows,
    enableColumnResizing: true,
    layoutMode: 'grid',
    //Disables the default flex-grow behavior of the table cells
    mantineTableHeadCellProps: {
      sx: {
        flex: '0 0 auto',
      },
    },
    mantineTableBodyCellProps: {
      sx: {
        flex: '0 0 auto',
      },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
  });

  return (
    <div className="w-full">
      <MantineReactTable table={table} />;
    </div>
  );
};

export default ResourcesTable;
