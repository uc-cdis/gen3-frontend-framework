import React from 'react';
import { Grid, rem, Transition } from '@mantine/core';
import {
  useGetWorkspaceOptionsQuery,
  WorkspaceInfo,
  WorkspaceStatus,
} from '@gen3/core';
import { ErrorCard } from '../../components/MessageCards';
import NotebookCard from './NotebookCard';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';

const WorkspacePanel = () => {
  const { data, isLoading, isError, isSuccess } = useGetWorkspaceOptionsQuery();
  const {
    isActive,
    workspaceStatus: { status },
  } = useWorkspaceStatusContext();

  if (isError) {
    return <ErrorCard message="Error loading workspace definitions" />;
  }

  return (
    <>
      <Transition
        mounted={status === WorkspaceStatus.NotFound}
        transition="scale-y"
        duration={600}
        exitDuration={600}
        timingFunction="ease"
      >
        {(styles) => (
          <div className="mt-4" style={styles}>
            <Grid justify="space-between" gutter="md">
              {data?.map((card: WorkspaceInfo) => {
                return (
                  <Grid.Col
                    key={card.id}
                    span="content"
                    style={{ minHeight: rem(120) }}
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
