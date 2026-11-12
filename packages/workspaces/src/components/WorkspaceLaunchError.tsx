import { useDisclosure } from '@mantine/hooks';
import {
  Button,
  Code,
  Group,
  Indicator,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAppWindow } from '@tabler/icons-react';

interface WorkspaceLaunchErrorProps {
  workspaceName?: string;
  reason?: string; // e.g. from hatchery status / pod events
  onRetry: () => void;
  onChooseAnother: () => void;
}

export default function WorkspaceLaunchError({
  workspaceName,
  reason,
  onRetry,
  onChooseAnother,
}: WorkspaceLaunchErrorProps) {
  const [detailsOpen, { toggle }] = useDisclosure(false);

  return (
    <Stack align="center" gap="md" maw={480} mx="auto" mt={80} ta="center">
      <Indicator color="red" size={14} offset={6} withBorder>
        <ThemeIcon variant="transparent" size={64} color="blue">
          <IconAppWindow size={56} stroke={1.5} />
        </ThemeIcon>
      </Indicator>

      <Stack gap={4}>
        <Title order={3} fw={500}>
          Workspace didn't start
        </Title>
        <Text c="dimmed">
          {workspaceName ? `The ${workspaceName} workspace` : 'Your workspace'}{' '}
          stopped before it finished launching.
        </Text>
      </Stack>

      <Group gap="sm">
        <Button onClick={onRetry}>Clear</Button>
      </Group>

      {reason && (
        <>
          <Button
            variant="transparent"
            size="compact-sm"
            c="dimmed"
            onClick={toggle}
          >
            {detailsOpen ? 'Hide details' : 'Show details'}
          </Button>
          {detailsOpen && (
            <Code
              block
              w="100%"
              ta="left"
              c="utility-contrast.3"
              style={{
                backgroundColor:
                  'rgb(from var(--mantine-color-utility-3) r g b / 0.6)',
              }}
            >
              {reason}
            </Code>
          )}
        </>
      )}
    </Stack>
  );
}
