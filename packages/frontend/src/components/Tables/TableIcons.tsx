import { MRT_Icons } from 'mantine-react-table';
import {
  TiArrowUnsorted as Unsorted,
  TiArrowSortedDown as SortDsc,
  TiArrowSortedUp as SortAsc,
} from 'react-icons/ti';

export const TableIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => <Unsorted {...props} />,
  IconSortAscending: (props: any) => <SortAsc {...props} />,
  IconSortDescending: (props: any) => <SortDsc {...props} />,
};
