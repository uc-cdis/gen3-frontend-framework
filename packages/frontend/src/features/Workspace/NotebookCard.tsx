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

  console.log(
    'disabled',
    status !== WorkspaceStatus.NotFound ||
      isPayModelNeededToLaunch ||
      (info.id !== workspaceId && requestedStatus === 'Launch'),
  );

  return (
    <Card withBorder radius="xs" className="w-64">
      <Card.Section inheritPadding py="xs">
        <Stack align="center">
          <Icon height={'48px'} icon={'workspace:jupyter'} />
          <Text
            ta="center"
            classNames={{ root: 'h-20 font-header' }}
            size="md"
            fw={500}
            lineClamp={3}
          >
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
          loading={info.id === workspaceId && requestedStatus === 'Launch'}
          disabled={
            status !== WorkspaceStatus.NotFound ||
            isPayModelNeededToLaunch ||
            (info.id !== workspaceId && requestedStatus === 'Launch')
          }
          onClick={() => {
            startWorkspace(info.id);
          }}
        >
          Launch
        </Button>
        <Transition
          mounted={
            (info.id === workspaceId && requestedStatus === 'Launch') ||
            status === 'Launching'
          }
          transition="fade"
          duration={400}
          timingFunction="ease"
        >
          {() => {
            if (info.id == workspaceId) {
              return (
                <Button
                  onClick={() => {
                    stopWorkspace();
                  }}
                >
                  Shutdown
                </Button>
              );
            } else {
              return <p />;
            }
          }}
        </Transition>
      </Group>
    </Card>
  );
};

export default NotebookCard;
