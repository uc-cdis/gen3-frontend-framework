import { Button, Card, Group, Stack, Text, Transition } from '@mantine/core';
import { Icon } from '@iconify/react';
import {
  selectActiveWorkspaceId,
  selectRequestedWorkspaceStatus,
  selectWorkspaceStatusFromService,
  useCoreSelector,
  WorkspaceInfo,
  WorkspaceStatus,
} from '@gen3/core';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';

const COMPUTE_PROPS_LABEL_STYLE =
  'text-base-lighter font-medium text-sm opacity-90';

interface NotebookCardParams {
  info: WorkspaceInfo;
}
const NotebookCard = ({ info }: NotebookCardParams) => {
  const { startWorkspace, stopWorkspace, isPayModelNeededToLaunch } =
    useWorkspaceStatusContext();

  const { status } = useCoreSelector(selectWorkspaceStatusFromService);
  const requestedStatus = useCoreSelector(selectRequestedWorkspaceStatus);
  const workspaceId = useCoreSelector(selectActiveWorkspaceId);

  return (
    <Card withBorder radius="xs" className="w-64">
      <Card.Section inheritPadding py="xs">
        <Stack align="center">
          <Icon height={'48px'} icon={'workspace:jupyter'} />
          <Text ta="center" className="font-header" size="md" fw={500}>
            {info.name}
          </Text>
        </Stack>
      </Card.Section>
      <Card.Section inheritPadding py="xs">
        <Group justify="center">
          <Text c="base-contrast.4" className={COMPUTE_PROPS_LABEL_STYLE}>
            CPU Limit: {info.cpuLimit}
          </Text>
          <Text
            c="base-contrast.4"
            className={COMPUTE_PROPS_LABEL_STYLE}
            size="xs"
          >
            Memory: {info.memoryLimit}
          </Text>
        </Group>
      </Card.Section>
      <div className="flex mx-8 justify-center border-1 border-base"></div>
      <Group className="mt-2 p-2" justify="center">
        <Button
          loading={info.id === workspaceId && requestedStatus === 'Launching'}
          disabled={
            status !== WorkspaceStatus.NotFound || isPayModelNeededToLaunch
          }
          onClick={() => {
            startWorkspace(info.id);
          }}
        >
          Launch
        </Button>
        <Transition
          mounted={info.id === workspaceId && requestedStatus === 'Launching'}
          transition="fade"
          duration={400}
          timingFunction="ease"
        >
          {() => (
            <Button
              onClick={() => {
                stopWorkspace();
              }}
            >
              Shutdown
            </Button>
          )}
        </Transition>
      </Group>
    </Card>
  );
};

export default NotebookCard;
