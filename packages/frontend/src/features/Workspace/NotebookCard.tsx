import {
  Button,
  Card,
  Center,
  Divider,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { Icon } from '@iconify/react';
import { WorkspaceInfo, WorkspaceStatus } from '@gen3/core';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';

const COMPUTE_PROPS_LABEL_STYLE =
  'text-base-lighter font-medium text-sm opacity-90';

interface NotebookCardParams {
  info: WorkspaceInfo;
}
const NotebookCard = ({ info }: NotebookCardParams) => {
  const {
    startWorkspace,
    workspaceLaunchIsLoading,
    workspaceStatus: { status },
  } = useWorkspaceStatusContext();

  return (
    <Card withBorder radius="xs" className="w-64">
      <Card.Section inheritPadding py="xs">
        <Stack align="center">
          <Icon height={'48px'} icon={'workspace:jupyter'} />
          <Text className="font-header" size="md" fw={500}>
            {info.name}
          </Text>
        </Stack>
      </Card.Section>
      <Card.Section inheritPadding py="xs">
        <Group justify="center">
          <Text c="base-contrast.4" fw={400} size="xs">
            CPU Limit: {info.cpuLimit}
          </Text>
          <Text
            color="base-contrast.4"
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
          loading={workspaceLaunchIsLoading}
          disabled={status !== WorkspaceStatus.NotFound}
          onClick={() => {
            startWorkspace(info.id);
          }}
        >
          Launch
        </Button>
      </Group>
    </Card>
  );
};

export default NotebookCard;
