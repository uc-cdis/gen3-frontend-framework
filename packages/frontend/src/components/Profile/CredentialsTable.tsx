import React, { useMemo } from 'react';
import { ActionIcon, Box, Table } from '@mantine/core';
import {
  useGetCredentialsQuery,
  useRemoveCredentialMutation,
  type APIKey,
  useGetCSRFQuery,
} from '@gen3/core';
import { MdDelete as DeleteIcon } from 'react-icons/md';
import { LuRefreshCw as RefreshIcon } from 'react-icons/lu';
import { unixTimeToString } from '../../utils';

const SOON_IN_DAYS = 86400 * 5;

import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_Cell,
  useMantineReactTable,
} from 'mantine-react-table';

const getStatus = (expiration: number, now: number) => {
  if (expiration < now) return 'Expired';
  else if (expiration - now < SOON_IN_DAYS) return 'Expiring Soon';
  return 'Active';
};

interface APIKeyStatus {
  actions: 'delete' | 'refreshDelete';
  expiration: number;
  key: string;
  status: string;
}

/**
 * Defines a Credentials Table that lists all credentials for a logged in user
 * with the ability to delete a given credential using useRemoveCredentialMutation() hook
 * @returns {JSX.Element} The JSX element representing the credentials table.
 */
const CredentialsTable = () => {
  const { data: csrfToken } = useGetCSRFQuery();
  const { data: credentials } = useGetCredentialsQuery();
  const [removeCredential] = useRemoveCredentialMutation();

  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'key',
        header: 'API Key',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'expiration',
        header: 'Expiration Date',
        accessorFn: (apiKey: APIKeyStatus) =>
          unixTimeToString(
            // pragma: allowlist-secret
            apiKey.expiration,
          ),
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        Cell: ({ row }: MRT_Cell<APIKeyStatus>) => (
          <div className="flex items-center">
            {row.original.actions === 'delete' ? (
              <ActionIcon
                onClick={() =>
                  removeCredential({
                    csrfToken: csrfToken?.csrfToken,
                    id: row.original.key,
                  })
                }
              >
                <DeleteIcon />
              </ActionIcon>
            ) : (
              <span>
                {' '}
                <RefreshIcon /> <DeleteIcon />
              </span>
            )}
          </div>
        ),
      },
    ] as MRT_ColumnDef<APIKeyStatus>[];
  }, [csrfToken, removeCredential]);

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  const rows = useMemo(() => {
    return credentials
      ? credentials.reduce((acc: APIKeyStatus[], c: APIKey) => {
          const status = getStatus(c.exp, currentTimeInSeconds);
          return acc.concat({
            key: c.jti,
            expiration: c.exp,
            status: status,
            actions: status === 'Active' ? 'delete' : 'refreshDelete',
          });
        }, [] as APIKeyStatus[])
      : [];
  }, [credentials, currentTimeInSeconds]);

  const table = useMantineReactTable<APIKeyStatus>({
    columns,
    data: rows,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    mantineSearchTextInputProps: {
      placeholder: 'Search API Keys',
    },
  });

  return <MantineReactTable table={table} />;
};

export default CredentialsTable;
