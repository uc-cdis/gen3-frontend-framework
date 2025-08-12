import { MRT_SortingState } from 'mantine-react-table';

//  Configure Gen3 Table Columns
export interface Gen3TableColumn {
  field: string;
  title: string;
  accessorPath?: string;
  type?: 'string' | 'number' | 'date' | 'array' | 'link';
  cellRenderFunction?: string;
  params?: Record<string, unknown>;
  width?: number;
  errorIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
}

/**
 *  Pagination options
 *  @property page - page on
 *  @property pages - total pages
 *  @property size - size of data set shown
 *  @property from - 0 indexed starting point of data shown
 *  @property total - total size of data set
 *  @property label - optional label of data shown
 *  @property disablePageSize - optional disable page size for pagination
 *  @category Table
 */

export interface PaginationOptions {
  /**
   * page on
   */
  page: number;
  /**
   * total pages
   */
  pages: number;
  /**
   * size of data set shown
   */
  size: number;
  /**
   * 0 indexed starting point of data shown
   */
  from: number;
  /**
   * total size of data set
   */
  total: number;
  /**
   * label of data shown
   */
  label: string;
}

export interface HandleChangeInput {
  /**
   * page on
   */
  newPageNumber?: number;
  /**
   * size of data set shown
   */
  newPageSize?: string;
  /**
   * column sort
   */
  sortBy?: MRT_SortingState;
  /**
   * search term change
   */
  newSearch?: string;
  /**
   * headings change
   */
  newHeadings?: any;
}
