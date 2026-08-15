import React from 'react';
import { MRT_Icons } from 'mantine-react-table-open';
import {
  TiArrowSortedDown as SortDsc,
  TiArrowSortedUp as SortAsc,
  TiArrowUnsorted as Unsorted,
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
