import React, { useMemo } from 'react';
import { type ServiceAndMethod } from '@gen3/core';
import { Badge } from '@mantine/core';
import { TableIcons } from '../../components/Tables/TableIcons';

import {
  MantineReactTable,
  MRT_Cell,
  MRT_ColumnDef,
  useMantineReactTable,
  MRT_Icons,
} from 'mantine-react-table';
import { useResourcesContext } from './ResourcesProvider';
import { useProfileContext } from './ProfileProvider';
import { ServiceColorAndLabel } from './types';
import { convertToRecordMethodToResource } from './utils';

interface ItemResource {
  resource: string;
  methods: Record<string, string[]>;
}

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
    <Badge variant="filled" color={color} aria-label={label}>
      {label}
    </Badge>
  );
};

interface ResourcesTableProps {
  filters: string[];
}

/**
 * ResourcesTable function creates a mantine-react-table'
 * to display user permissions from the useResourcesContext
 * and the useProfileContext context hooks
 *
 * @param filters - filters passed in from filters panel.
 * @returns A resources table for viewing methods, services that user has access to
 * on specified resource paths.
 */
const ResourcesTable = ({ filters }: ResourcesTableProps) => {
  const { userProfile, servicesAndMethods } = useResourcesContext();
  const { profileConfig } = useProfileContext();
  let rows: ItemResource[] = [];

  rows = useMemo(() => {
    return Object.entries(userProfile?.authz ?? {})
      .map(([key, authz]) => {
        const methods = convertToRecordMethodToResource(authz, filters);
        return {
          resource: key,
          methods: methods,
        };
      })
      .filter((row) => Object.keys(row.methods).length > 0);
  }, [filters, userProfile?.authz]);

  const columns = useMemo(() => {
    return [
      {
        header: 'Resource(s)',
        accessorKey: 'resource',
        Cell: ({ row }: MRT_Cell<ItemResource>) => (
          <div>{row.original.resource}</div>
        ),
        mantineTableHeadCellProps: {
          align: 'left',
        },
        mantineTableBodyCellProps: {
          align: 'left',
        },
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
  }, [profileConfig.resourceTable?.serviceColors, servicesAndMethods.methods]);

  const table = useMantineReactTable<ItemResource>({
    columns,
    data: rows,
    enableColumnResizing: true,
    enableTopToolbar: false,
    layoutMode: 'grid',
    icons: TableIcons,
    //Disables the default flex-grow behavior of the table cells
    mantineTableHeadRowProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-secondary-8)',
        borderColor: 'var(--mantine-color-base-8)',
        borderWidth: '1px',
        boxShadow: 'none',
        align: 'center',
      },
    },
    mantineTableHeadCellProps: {
      align: 'center',
    },
    mantineTableBodyCellProps: {
      align: 'center',
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
  });

  return (
    <div className="w-full">
      <MantineReactTable table={table} />
    </div>
  );
};

export default ResourcesTable;
