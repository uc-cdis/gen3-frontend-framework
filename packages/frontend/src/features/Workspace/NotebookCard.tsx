import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
  Transition,
} from '@mantine/core';
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
import { PayModelStatus } from './types';

const LaunchDisabledMessage: Record<PayModelStatus, string> = {
  NOT_SELECTED: 'A pay model is not selected',
  NOT_REQUIRED: 'A pay model is not required',
  VALID: 'Launch Workspace',
  INVALID: 'A pay model is invalid',
  ERROR: 'An error occurred getting the pay model status',
  OVER_LIMIT: 'You have exceeded your pay model limit',
  GETTING: 'Getting pay model status',
};

const COMPUTE_PROPS_LABEL_STYLE =
  'text-base-lighter font-medium text-sm opacity-90';

interface NotebookCardParams {
  info: WorkspaceInfo;
}
const NotebookCard = ({ info }: NotebookCardParams) => {
  const { startWorkspace, stopWorkspace, payModelStatus } =
    useWorkspaceStatusContext();

  const { status } = useCoreSelector(selectWorkspaceStatusFromService);
  const requestedStatus = useCoreSelector(selectRequestedWorkspaceStatus);
  const workspaceId = useCoreSelector(selectActiveWorkspaceId);

  const launchDisabled =
    status !== WorkspaceStatus.NotFound ||
    !(
      payModelStatus === PayModelStatus.NOT_REQUIRED ||
      payModelStatus === PayModelStatus.VALID
    ) ||
    (info.id !== workspaceId && requestedStatus === 'Launch');

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
        <Tooltip label={LaunchDisabledMessage[payModelStatus]}>
          <Button
            loading={info.id === workspaceId && requestedStatus === 'Launch'}
            data-disabled={launchDisabled}
            onClick={(event) => {
              event.preventDefault();
              startWorkspace(info.id);
            }}
          >
            Launch
          </Button>
        </Tooltip>
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
