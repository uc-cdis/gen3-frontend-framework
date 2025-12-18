import React, { useMemo } from 'react';
import { filesize } from 'filesize';
import { createColumnHelper } from '@tanstack/react-table';
import { CartItem } from '@gen3/core';

interface AuthorizationTableProps {
  readonly filesByCanAccess: Record<string, CartItem[]>;
  readonly loading: boolean;
  readonly customDataTestID: string;
}

const AuthorizationTable: React.FC<AuthorizationTableProps> = ({
  filesByCanAccess,
  loading,
  customDataTestID,
}: AuthorizationTableProps) => {
  const authorizationTableData = [
    {
      level: 'Authorized',
      files: filesByCanAccess?.true?.length || 0,
      file_size: filesize(
        filesByCanAccess?.true
          ?.map((f) => f.file_size)
          .reduce((previousFile, file) => previousFile + file) || 0,
      ),
    },
    {
      level: 'Unauthorized',
      files: filesByCanAccess?.false?.length || 0,
      file_size: filesize(
        filesByCanAccess?.false
          ?.map((f) => f.file_size)
          .reduce((previousFile, file) => previousFile + file) || 0,
      ),
    },
  ];

  const authorizationTableColumnHelper =
    createColumnHelper<(typeof authorizationTableData)[0]>();

  const authorizationTableColumns = useMemo(
    () => [
      authorizationTableColumnHelper.accessor('level', {
        id: 'level',
        header: 'Level',
      }),
      authorizationTableColumnHelper.accessor('files', {
        id: 'files',
        header: 'Files',
        cell: ({ getValue }) => getValue()?.toLocaleString(),
      }),
      authorizationTableColumnHelper.accessor('file_size', {
        id: 'file_size',
        header: 'File Size',
      }),
    ],
    [authorizationTableColumnHelper],
  );

  return (
    <VerticalTable
      customDataTestID={customDataTestID}
      data={authorizationTableData}
      columns={authorizationTableColumns}
      status={loading ? 'pending' : 'fulfilled'}
    />
  );
};

export default AuthorizationTable;
