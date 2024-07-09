import React from 'react';
import { Grid, LoadingOverlay } from '@mantine/core';
import { useGetWorkspaceOptionsQuery, WorkspaceInfo } from '@gen3/core';
import { ErrorCard } from '../../components/MessageCards';
import NotebookCard from './NotebookCard';

const WorkspacePanel = () => {
  const { data, isLoading, isError } = useGetWorkspaceOptionsQuery();

  if (isError) {
    return <ErrorCard message="Error loading workspace definitions" />;
  }

  return (
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
  );
};

export default WorkspacePanel;
