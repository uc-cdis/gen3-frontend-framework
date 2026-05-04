import React, { useEffect, useMemo, useState } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import DictionaryPanel from './DictionaryPanel/DictionaryPanel';
import { DictionaryConfig } from '../Dictionary';
import SectionCollapse from './SectionCollapse';
import { parseTSVFile, ROW_LIMIT } from './utils';

const AddDataToProject = ({ config }: { config?: DictionaryConfig }) => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [uploadedData, setUploadedData] = useState<
    { headers: string[]; rows: Record<string, string>[] } | undefined
  >(undefined);
  const [parseError, setParseError] = useState<boolean>(false);

  useEffect(() => {
    const parseFile = async () => {
      if (file) {
        try {
          const parsedData = await parseTSVFile(file);
          setUploadedData(parsedData);
          setParseError(false);
        } catch {
          setUploadedData(undefined);
          setParseError(true);
        }
      } else {
        setUploadedData(undefined);
      }
    };

    parseFile();
  }, [file]);

  const columns = useMemo(
    () => [
      { accessorKey: 'status', header: 'Status' },
      ...(uploadedData?.headers || []).map((header) => ({
        accessorKey: header,
        header,
      })),
    ],
    [uploadedData],
  );

  const data = useMemo(
    () => uploadedData?.rows.map((row) => ({ status: '--', ...row })) || [],
    [uploadedData],
  );

  const table = useMantineReactTable({
    columns,
    data,
    enablePagination: true,
    enableTopToolbar: false,
  });

  return (
    <div className="w-full flex">
      <div className="bg-white w-1/3">
        <DictionaryPanel
          config={config}
          file={file}
          setFile={setFile}
          uploadedDataLength={(uploadedData?.rows || []).length}
          parseError={parseError}
        />
      </div>
      <div className="w-2/3 p-4">
        {data.length > 0 && data.length <= ROW_LIMIT && file ? (
          <SectionCollapse text={file?.name}>
            <MantineReactTable table={table} />
          </SectionCollapse>
        ) : null}
        <div className="p-2">{'Graph not implemented yet'}</div>
      </div>
    </div>
  );
};

export default AddDataToProject;
