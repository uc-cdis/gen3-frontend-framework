import React, { useMemo } from 'react';
import { Loader } from '@mantine/core';
import {
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table-open';
import { filesize } from 'filesize';
import { useGetIndexObjectQuery } from '@gen3/core';
import { SummaryCard } from '../../components/Summary/SummaryCard';
import { formatDataForHorizontalTable } from '../../components/HorizontalTable/utils';

const FileSummary = ({ guid }: { guid: string }) => {
  const { data, isLoading } = useGetIndexObjectQuery(guid);

  const fileSummaryData = useMemo(
    () =>
      data
        ? formatDataForHorizontalTable(data, [
            { name: 'Name', field: 'file_name' },
            { name: 'Authz', field: 'authz' },
            { name: 'GUID', field: 'did' },
            { name: 'Size', field: 'size', modifier: filesize },
            { name: 'Creation Date', field: 'content_created_date' },
            { name: 'Updated Date', field: 'content_updated_date' },
          ])
        : [],
    [data],
  );

  const checksumsData = useMemo(
    () =>
      data?.hashes
        ? formatDataForHorizontalTable(data?.hashes, [
            { name: 'CRC', field: 'crc' },
            { name: 'MD5', field: 'md5' },
            { name: 'SHA1', field: 'sha1' },
            { name: 'SHA256', field: 'sha256' },
            { name: 'SHA512', field: 'sha512' },
          ])
        : [],
    [data],
  );

  const urlTableColumns = useMemo(
    () => [{ accessorKey: 'url', header: 'URL' }],
    [],
  );

  const urlTableData = useMemo(
    () => (data?.urls ? data?.urls.map((url) => ({ url })) : []),
    [data],
  );

  const table = useMantineReactTable({
    columns: urlTableColumns,
    data: urlTableData,
    state: { isLoading },
    enableTopToolbar: false,
    enableColumnActions: false,
    enableSorting: false,
  });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col m-4">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-4">
            <div className="flex-1">
              <SummaryCard
                title="File Properties"
                tableData={fileSummaryData}
              />
            </div>
            <div className="flex-1">
              <SummaryCard title="Checksums" tableData={checksumsData} />
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <h2 className="text-lg text-primary-content-darkest uppercase tracking-wide font-medium">
              URLs
            </h2>
            <MantineReactTable table={table} />
          </div>
        </div>
      )}
    </>
  );
};

export default FileSummary;
