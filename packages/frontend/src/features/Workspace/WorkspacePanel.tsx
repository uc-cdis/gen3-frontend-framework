import React from 'react';
import { Grid, LoadingOverlay, rem } from '@mantine/core';
import {
  useGetWorkspaceOptionsQuery,
  useGetWorkspaceStatusQuery,
  WorkspaceInfo,
} from '@gen3/core';
import { ErrorCard } from '../../components/MessageCards';
import NotebookCard from './NotebookCard';

const WorkspacePanel = () => {
  const { data, isLoading, isError } = useGetWorkspaceOptionsQuery();
  const { data: workspaceStatus, isSuccess } = useGetWorkspaceStatusQuery();

  console.log('workspaceStatus', workspaceStatus);

  if (isError) {
    return <ErrorCard message="Error loading workspace definitions" />;
  }

  return (
    <div className="mt-10">
      <LoadingOverlay visible={isLoading} />
      <Grid
        justify="space-between"
        gutter={5}
        gutterXs="md"
        gutterMd="xl"
        gutterXl={50}
      >
        {data?.map((card: WorkspaceInfo) => {
          return (
            <Grid.Col key={card.id} span={3} style={{ minHeight: rem(120) }}>
              <NotebookCard info={card} />
            </Grid.Col>
          );
        })}
      </Grid>
    </div>
  );
};

export default WorkspacePanel;
