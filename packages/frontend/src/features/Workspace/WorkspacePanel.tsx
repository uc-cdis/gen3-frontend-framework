import React from 'react';
import { Grid, LoadingOverlay, rem, Transition } from '@mantine/core';
import {
  selectActiveWorkspaceStatus,
  useCoreSelector,
  useGetWorkspaceOptionsQuery,
  useGetWorkspaceStatusQuery,
  WorkspaceInfo,
  WorkspaceStatus,
} from '@gen3/core';
import { ErrorCard } from '../../components/MessageCards';
import NotebookCard from './NotebookCard';

const WorkspacePanel = () => {
  const { data, isLoading, isError } = useGetWorkspaceOptionsQuery();

  const { data: workspaceStatusData } = useGetWorkspaceStatusQuery(undefined);

  if (isError) {
    return <ErrorCard message="Error loading workspace definitions" />;
  }

  if (isError) {
    return <ErrorCard message="Error loading workspace definitions" />;
  }

  const workspaceStatus = workspaceStatusData?.status;
  return (
    <>
      <Transition
        mounted={
          workspaceStatus === WorkspaceStatus.NotFound ||
          workspaceStatus === WorkspaceStatus.Launching
        }
        transition="scale-y"
        duration={600}
        exitDuration={600}
        timingFunction="ease"
      >
        {(styles) => (
          <div className="px-2 mt-4" style={styles}>
            <LoadingOverlay visible={isLoading} />
            <Grid
              justify="center"
              align="stretch"
              gutter="sm"
              overflow="hidden"
            >
              {data?.map((card: WorkspaceInfo) => {
                return (
                  <Grid.Col
                    key={card.id}
                    span="content"
                    style={{ minHeight: rem(150) }}
                  >
                    <NotebookCard info={card} />
                  </Grid.Col>
                );
              })}
            </Grid>
          </div>
        )}
      </Transition>
    </>
  );
};

export default WorkspacePanel;
