import React, { useEffect, useMemo, useState } from 'react';
import { filesize } from 'filesize';
import { capitalize } from 'lodash';
import {
  GQLFilter as GqlOperation,
  selectCart,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { CartFile, FilesTableDataType, SortBy } from '@/core';
import { MMRFFile, useGetFilesQuery } from '@/core/features/files/filesSlice';
import { RemoveFromCartButton } from './updateCart';
import FunctionButton from '@/components/FunctionButton';
import { PopupIconButton } from '@/components/PopupIconButton/PopupIconButton';
import { getFormattedTimestamp } from 'src/utils/date';
import { FileAccessBadge } from '@/components/FileAccessBadge';
import { statusBooleansToDataStatus } from 'src/utils';
import {
  ColumnOrderState,
  createColumnHelper,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import VerticalTable from '@/components/Table/VerticalTable';
import { HandleChangeInput } from '@/components/Table/types';
import { downloadTSV } from '@/components/Table/utils';
import { useDeepCompareMemo } from 'use-deep-compare';
import TotalItems from '@/components/Table/TotalItem';
import { Image } from '@/components/Image';
import Link from 'next/link';

interface FilesTableProps {
  readonly filesByCanAccess: Record<string, CartFile[]>;
  readonly customDataTestID: string;
}

const download = (arg: any) => null;

const cartFilesTableColumnHelper = createColumnHelper<FilesTableDataType>();

const FilesTable: React.FC<FilesTableProps> = ({
  customDataTestID,
}: FilesTableProps) => {
  const cart = useCoreSelector((state) => selectCart(state));
  const dispatch = useCoreDispatch();
  const [tableData, setTableData] = useState<FilesTableDataType[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [activePage, setActivePage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [jsonDownloadInProgress, setJsonDownloadInProgress] = useState(false);

  const sortByActions = (sortByObj: SortingState) => {
    const tempSortBy: SortBy[] = sortByObj.map((sortObj) => {
      let tempSortId = sortObj.id;
      // map sort ids to api ids
      if (sortObj.id === 'project') {
        tempSortId = 'cases.project.project_id';
      } else if (sortObj.id === 'file_uuid') {
        tempSortId = 'file_id';
      }
      return {
        field: tempSortId,
        direction: sortObj.desc ? 'desc' : 'asc',
      };
    });
    setSortBy(tempSortBy);
  };

  const tableFilters: GqlOperation = {
    and: [
      {
        in: {
          file_id: cart.map((f) => f?.file_id),
        },
      },
    ],
  };

  const { data, isFetching, isSuccess, isError } = useGetFilesQuery({
    size: pageSize,
    from: pageSize * (activePage - 1),
    filters: tableFilters,
    searchTerm: searchTerm,
    sortBy: sortBy,
  });

  useEffect(() => {
    setTableData(
      isSuccess
        ? (data?.files.map((file: MMRFFile) => ({
            file: file,
            file_uuid: file?.file_id ?? 'N/A',
            access: file.access,
            file_name: file?.file_name ?? 'N/A',
            cases: file.cases,
            project: file.project_id,
            data_category: file.data_category,
            data_type: file.data_type,
            data_format: file.data_format,
            experimental_strategy: file.experimental_strategy || '--',
            platform: file.platform || '--',
            file_size: filesize(file.file_size),
            annotations: file.annotations,
          })) as FilesTableDataType[])
        : [],
    );
  }, [isSuccess, data?.files]);

  const pagination = useDeepCompareMemo(() => {
    return isSuccess
      ? {
          count: pageSize,
          from: (activePage - 1) * pageSize,
          page: activePage,
          pages: Math.ceil(data?.total / pageSize),
          size: pageSize,
          total: data?.total,
          sort: 'None',
          label: 'file',
        }
      : {
          count: 0,
          from: 1,
          page: 0,
          pages: 0,
          size: 0,
          total: 0,
          label: '',
        };
  }, [pageSize, activePage, data?.total, isSuccess]);

  const cartFilesTableDefaultColumns = useMemo(
    () => [
      cartFilesTableColumnHelper.display({
        id: 'remove',
        header: 'Remove',
        cell: ({ row }) => (
          <RemoveFromCartButton
            files={[
              { id: row.original.file_uuid, file_id: row.original.file_uuid },
            ]}
            iconOnly
          />
        ),
      }),
      cartFilesTableColumnHelper.accessor('file_uuid', {
        id: 'file_uuid',
        header: 'File UUID',
        cell: ({ getValue }) => {
          const value = getValue()?.toString() ?? '';
          const uuid = encodeURIComponent(value);
          return (
            <div className="flex flex-nowrap items-center align-middle gap-2">
              <Image
                src="/icons/OpenModal.svg"
                width={10}
                height={18}
                layout="fixed"
                alt=""
              />
              <Link
                href={`/files/${uuid?.toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-utility-link underline font-content text-left"
              >
                {value}
              </Link>
            </div>
          );
        },
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('access', {
        id: 'access',
        header: 'Access',
        cell: ({ getValue }) => <FileAccessBadge access={getValue()} />,
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('file_name', {
        id: 'file_name',
        header: 'File Name',
        cell: ({ getValue, row }) => {
          const value = getValue()?.toString() ?? '';
          const uuid = encodeURIComponent(
            row?.original?.file_uuid ?? 'Not Found',
          );
          return (
            <div className="flex flex-nowrap items-center align-middle gap-2">
              <Image
                src="/icons/OpenModal.svg"
                width={10}
                height={18}
                layout="fixed"
                alt=""
              />
              <Link
                href={`/files/${uuid?.toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-utility-link underline font-content text-left"
              >
                {value}
              </Link>
            </div>
          );
        },
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.display({
        id: 'cases',
        header: 'Cases',
        cell: ({ row }) => (
          <PopupIconButton
            handleClick={() => {
              if (row.original.cases?.length === 0) return;
              setEntityMetadata({
                entity_type: row.original.cases?.length === 1 ? 'case' : 'file',
                entity_id:
                  row.original.cases?.length === 1
                    ? row.original.cases?.[0].case_id
                    : row.original.file_uuid,
              });
            }}
            label={row.original.cases?.length.toLocaleString() || 0}
            customAriaLabel={`Open ${
              row.original.cases?.length === 1 ? 'case' : 'file'
            } information in modal`}
            customStyle={`font-content ${
              row.original.cases?.length > 0
                ? 'text-utility-link underline'
                : 'cursor-default'
            }`}
          />
        ),
      }),
      cartFilesTableColumnHelper.accessor('project', {
        id: 'project',
        header: 'Project',
        cell: ({ getValue }) => (
          <PopupIconButton
            handleClick={() =>
              setEntityMetadata({
                entity_type: 'project',
                entity_id: getValue(),
              })
            }
            label={getValue()}
            customStyle="text-utility-link underline font-content"
          />
        ),
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('data_category', {
        id: 'data_category',
        header: 'Data Category',
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('data_type', {
        id: 'data_type',
        header: 'Data Type',
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('data_format', {
        id: 'data_format',
        header: 'Data Format',
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('experimental_strategy', {
        id: 'experimental_strategy',
        header: 'Experimental Strategy',
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('platform', {
        id: 'platform',
        header: 'Platform',
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.accessor('file_size', {
        id: 'file_size',
        header: 'File Size',
        enableSorting: true,
      }),
      cartFilesTableColumnHelper.display({
        id: 'annotations',
        header: 'Annotations',
        cell: ({ row }) => row.original?.annotations?.length ?? 0,
      }),
    ],
    [setEntityMetadata],
  );

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    cartFilesTableDefaultColumns.map((column) => column.id as string), //must start out with populated columnOrder so we can splice
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    file_uuid: false,
    data_type: false,
    experimental_strategy: false,
    platform: false,
  });

  const handleChange = (obj: HandleChangeInput) => {
    switch (Object.keys(obj)?.[0]) {
      case 'newPageSize':
        setActivePage(1);
        setPageSize(parseInt(obj.newPageSize ?? '0'));
        break;
      case 'newPageNumber':
        setActivePage(obj.newPageNumber ?? 0);
        break;
      case 'newSearch':
        setActivePage(1);
        setSearchTerm(obj.newSearch ?? '');
        break;
    }
  };

  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    sortByActions(sorting);
  }, [sorting]);

  const handleDownloadJSON = async () => {
    setJsonDownloadInProgress(true);
    await download({
      endpoint: 'files',
      method: 'POST',
      params: {
        filters: tableFilters,
        size: 10000,
        attachment: true,
        format: 'JSON',
        pretty: true,
        annotations: true,
        related_files: true,
        fields: [
          'file_id',
          'access',
          'file_name',
          'cases.case_id',
          'cases.project.project_id',
          'data_category',
          'data_type',
          'data_format',
          'experimental_strategy',
          'platform',
          'file_size',
          'annotations.annotation_id',
        ].join(','),
      },
      dispatch,
      done: () => setJsonDownloadInProgress(false),
    });
  };

  const handleDownloadTSV = () => {
    downloadTSV({
      tableData,
      columnOrder,
      fileName: `files-table.${getFormattedTimestamp()}.tsv`,
      columnVisibility,
      columns: cartFilesTableDefaultColumns as any,
      option: {
        blacklist: ['remove'],
        overwrite: {
          access: {
            composer: (file) => capitalize(file.access),
          },
          cases: {
            composer: (file) => file.cases?.length.toLocaleString() || 0,
          },
          annotations: {
            composer: (file) => file.annotations?.length || 0,
          },
        },
      },
    });
  };

  return (
    <VerticalTable
      customDataTestID={customDataTestID}
      data={tableData}
      columns={cartFilesTableDefaultColumns}
      tableTotalDetail={<TotalItems total={data?.total} itemName="file" />}
      additionalControls={
        <div className="flex gap-2">
          <FunctionButton
            data-testid="button-json"
            onClick={handleDownloadJSON}
            aria-label="Download JSON"
            disabled={isFetching}
            isDownload
            isActive={jsonDownloadInProgress}
          >
            JSON
          </FunctionButton>
          <FunctionButton
            data-testid="button-tsv"
            onClick={handleDownloadTSV}
            aria-label="Download TSV"
            disabled={isFetching}
          >
            TSV
          </FunctionButton>
        </div>
      }
      pagination={pagination}
      status={statusBooleansToDataStatus(isFetching, isSuccess, isError)}
      handleChange={handleChange}
      search={{
        enabled: true,
        tooltip:
          'e.g. HCM-CSHL-0062-C18.json, 4b5f5ba0-3010-4449-99d4-7bd7a6d73422, HCM-CSHL-0062-C18',
      }}
      showControls={true}
      setColumnVisibility={setColumnVisibility}
      columnVisibility={columnVisibility}
      columnOrder={columnOrder}
      columnSorting="manual"
      sorting={sorting}
      setSorting={setSorting}
      setColumnOrder={setColumnOrder}
    />
  );
};

export default FilesTable;
