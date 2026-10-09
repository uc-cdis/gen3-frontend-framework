import type { MRT_RowData, MRT_SortingFn } from 'mantine-react-table-open';

export const createNumericSort =
  <TData extends MRT_RowData = MRT_RowData>(): MRT_SortingFn<TData> =>
  (rowA, rowB, columnId) => {
    return (
      (rowA.getValue<number>(columnId) ?? 0) -
      (rowB.getValue<number>(columnId) ?? 0)
    );
  };

export const defaultStringSort =
  <TData extends MRT_RowData = MRT_RowData>(): MRT_SortingFn<TData> =>
  (rowA, rowB, columnId) => {
    const aValue = rowA.getValue<any>(columnId);
    const bValue = rowB.getValue<any>(columnId);

    return aValue === bValue ? 0 : aValue > bValue ? 1 : -1;
  };
