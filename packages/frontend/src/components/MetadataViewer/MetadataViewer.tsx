'use client';

import { Box } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { DataTable } from 'mantine-datatable';

interface DataRecord {
  id: number;
  name: string;
  bornIn: number;
  party: string;
}

interface MetadataViewerProps {
  config?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MetadataViewer = ({ config }: MetadataViewerProps) => {
  return (
    <div>
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        // 👇 provide data
        records={[
          { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
          // more records...
        ]}
        // 👇 define columns
        columns={[
          {
            accessor: 'id',
            // 👇 this column has a custom title
            title: '#',
            // 👇 right-align column
            textAlign: 'right',
          },
          { accessor: 'name' },
          {
            accessor: 'party',
            // 👇 this column has custom cell data rendering
            render: ({ party }) => (
              <Box fw={700} c={party === 'Democratic' ? 'blue' : 'red'}>
                {party.slice(0, 3).toUpperCase()}
              </Box>
            ),
          },
          { accessor: 'bornIn' },
        ]}
        // 👇 execute this callback when a row is clicked
        onRowClick={({ record: { name, party, bornIn } }) =>
          showNotification({
            position: 'top-center',
            title: `Clicked on ${name}`,
            message: `You clicked on ${name}, a ${party.toLowerCase()} president born in ${bornIn}`,
            withBorder: true,
          })
        }
      />
      );
    </div>
  );
};

export default MetadataViewer;
