import { Button, Card, Center, Divider, Group, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
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
    stopWorkspace,
    workspaceLaunchIsLoading,
    terminateIsLoading,
    workspaceStatus: { status },
  } = useWorkspaceStatusContext();

  const [isTerminating] = useDebouncedValue(
    terminateIsLoading || status === WorkspaceStatus.Terminating,
    300,
  );

  return (
    <Card withBorder radius="xs">
      <Card.Section inheritPadding py="xs">
        <Center>
          <Text className="font-header" align="center" size="md" fw={500}>
            {info.name}
          </Text>
        </Center>
      </Card.Section>
      <Card.Section inheritPadding py="xs">
        <Group position="center">
          <Text color="base-contrast.4" fw={400} size="xs">
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
      <Group className="mt-2 p-2" position="center">
        <Button
          loading={workspaceLaunchIsLoading}
          disabled={status !== WorkspaceStatus.NotFound}
          onClick={() => {
            startWorkspace(info.id);
          }}
        >
          Launch
        </Button>
        <Button
          loading={isTerminating}
          disabled={status == WorkspaceStatus.NotFound}
          onClick={() => {
            stopWorkspace();
          }}
        >
          Terminate
        </Button>
      </Group>
    </Card>
  );
};

export default NotebookCard;
