import { MRT_TableOptions } from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';

export const commonTableSettings: Partial<MRT_TableOptions<any>> = {
  enableColumnResizing: false,
  icons: TableIcons,
  enableTopToolbar: false,
  enableColumnFilters: false,
  enableColumnActions: false,
  enableRowActions: true,
  enableColumnOrdering: false,
  enableFacetedValues: true,
  enableGrouping: false,
  enableColumnPinning: false,
  enableRowSelection: true,
  enablePagination: false,
  enableSelectAll: false,
  enableExpandAll: false,

  displayColumnDefOptions: {
    'mrt-row-select': {
      size: 5,
      header: '',
    },
    'mrt-row-expand': {
      size: 5,
      header: '',
    },
    'mrt-row-actions': {
      header: '',
    },
  },

  initialState: {
    density: 'xs',
    columnPinning: {
      left: ['mrt-row-select', 'mrt-row-expand'],
      right: ['mrt-row-actions'],
    },
  },
  layoutMode: 'semantic',
  mantineDetailPanelProps: {
    style: {
      boxShadow: '0 -2px 0px 0px var(--table-border-color) inset',
    },
  },
  mantineTableProps: {
    style: {
      backgroundColor: 'var(--mantine-color-base-1)',
      '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
    },
  },
  mantineTableHeadCellProps: {
    style: {
      backgroundColor: 'var(--mantine-color-table-1)',
      color: 'var(--mantine-color-table-contrast-1)',
      textAlign: 'center',
      fontWeight: 600,
      fontSize: 'var(--mantine-font-size-sm)',
      textTransform: 'uppercase',
    },
  },
};
