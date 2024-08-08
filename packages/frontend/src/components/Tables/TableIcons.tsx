import { MRT_Icons } from 'mantine-react-table';
import {
  TiArrowUnsorted as Unsorted,
  TiArrowSortedDown as SortDsc,
  TiArrowSortedUp as SortAsc,
} from 'react-icons/ti';

import { FiMoreVertical as ColumnMenu } from 'react-icons/fi';

export const TableIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => (
    <Unsorted {...props} className="text-accent" />
  ),
  IconSortAscending: (props: any) => (
    <SortAsc {...props} className="text-accent" />
  ),
  IconSortDescending: (props: any) => (
    <SortDsc {...props} className="text-accent" />
  ),
  IconDotsVertical: (props: any) => (
    <ColumnMenu {...props} className="text-accent" />
  ),
};
