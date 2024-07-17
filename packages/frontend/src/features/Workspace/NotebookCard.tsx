import { Button, Card, Group, Text } from '@mantine/core';
import { useLaunchWorkspaceMutation, WorkspaceInfo } from '@gen3/core';
import { useWorkspaceContext } from './WorkspaceProvider';

interface NotebookCardParams {
  info: WorkspaceInfo;
}
const NotebookCard = ({ info }: NotebookCardParams) => {
  const { config } = useWorkspaceContext();

  const [
    launchTrigger,
    { isLoading: apiIsLoading, data: aiResponse, error: aiError },
    // This is the destructured mutation result
  ] = useLaunchWorkspaceMutation();

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
      <Button
        onClick={async () => {
          await launchTrigger(info.id);
        }}
      >
        Launch
      </Button>
    </Card>
  );
};

export default NotebookCard;
