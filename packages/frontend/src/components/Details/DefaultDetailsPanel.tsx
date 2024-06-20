import { Box, Group, Stack, Text } from '@mantine/core';
import { DetailsPanelComponentProps } from './types';

const DefaultDetailsPanel = ({ id }: DetailsPanelComponentProps) => {
  return (
    <Box>
      <Group>
        <Stack>
          <Text>Details Panel {id}</Text>
        </Stack>
      </Group>
    </Box>
  );
};

export default DefaultDetailsPanel;
