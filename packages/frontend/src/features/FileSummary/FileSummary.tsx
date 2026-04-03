import { useMemo } from 'react';
import { Loader } from '@mantine/core';
import { useGetIndexObjectQuery } from '@gen3/core';
import { SummaryCard } from '../../components/Summary/SummaryCard';

const FileSummary = ({ guid }: { guid: string }) => {
  const { data, isLoading } = useGetIndexObjectQuery(guid);

  const fileSummaryData = useMemo(
    () => [
      { headerName: 'Name', values: [data?.file_name] },
      { headerName: 'Authz', values: data?.authz ?? [] },
      { headerName: 'GUID', values: [data?.did] },
      { headerName: 'Size', values: [data?.size] },
    ],

    [data],
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <SummaryCard title="File Properties" tableData={fileSummaryData} />
      )}
    </>
  );
};

export default FileSummary;
