import React from 'react';
import { useGetWorkspaceOptionsQuery, type WorkspaceInfo } from '@gen3/core';
import { LoadingOverlay, Grid } from '@mantine/core';
import { WorkspaceConfig } from './types';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import PaymentPanel from './PaymentPanel';
import NotebookCard from './NotebookCard';
import WorkspaceProvider from './WorkspaceProvider';

interface WorkspaceProps {
  config: WorkspaceConfig;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Workspace = ({ config }: WorkspaceProps) => {
  const { data, isLoading, isError } = useGetWorkspaceOptionsQuery();

  return (
    <ProtectedContent>
      <WorkspaceProvider config={config}>
        <div className="w-full relative">
          <LoadingOverlay visible={isLoading} />
          <PaymentPanel />
          <div className="mt-10">
            <LoadingOverlay visible={isLoading} />
            <Grid justify="space-between">
              {data?.map((card: WorkspaceInfo) => {
                return (
                  <Grid.Col key={card.id}>
                    <NotebookCard info={card} />
                  </Grid.Col>
                );
              })}
            </Grid>
          </div>
        </div>
      </WorkspaceProvider>
    </ProtectedContent>
  );
};

export default Workspace;
