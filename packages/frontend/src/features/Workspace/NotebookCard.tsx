import { Button, Card, Group, Text } from '@mantine/core';
import { WorkspaceInfo } from '@gen3/core';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';

interface NotebookCardParams {
  info: WorkspaceInfo;
}
const NotebookCard = ({ info }: NotebookCardParams) => {
  const {
    startWorkspace,
    stopWorkspace,
    workspaceLaunchIsLoading,
    terminateIsLoading,
  } = useWorkspaceStatusContext();

  return (
    <Card withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Text>{info.name}</Text>
      </Card.Section>
      <Card.Section withBorder inheritPadding py="xs">
        <Group>
          <Text>CPU Limit: {info.cpuLimit}</Text>
          <Text>Memory: {info.memoryLimit}</Text>
        </Group>
      </Card.Section>
      <Group>
        <Button
          loading={workspaceLaunchIsLoading}
          onClick={() => {
            startWorkspace(info.id);
          }}
        >
          Launch
        </Button>
        <Button
          loading={terminateIsLoading}
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
