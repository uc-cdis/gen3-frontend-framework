import React from 'react';
import {
  Accordion,
  Box,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';

export type ServiceStatus = string;

type ServiceTimestamp = string | number | Date;

export type ServiceStatusCardProps = {
  label: string;
  status: ServiceStatus;
  timestamp?: ServiceTimestamp;
  additionalInfo?: React.ReactNode;
};

function formatTimestamp(ts?: ServiceTimestamp) {
  if (!ts) return '—';
  if (typeof ts === 'number') {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  }
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleString();
}

export const ServiceStatusCard = ({
  label,
  status,
  timestamp,
  additionalInfo,
}: ServiceStatusCardProps) => {
  const isOk = status === 'Ok';
  const dotColor = isOk ? 'green' : 'red';

  return (
    <Card withBorder radius="md" padding="md">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ThemeIcon
              color={dotColor}
              variant="filled"
              radius="xl"
              size={12}
              aria-label={isOk ? 'Status OK' : 'Status NOT OK'}
            />
            <Box>
              <Text fw={600}>{label}</Text>
              <Text size="sm" c="dimmed">
                {status}
              </Text>
            </Box>
          </Group>

          <Text size="xs" c="dimmed">
            {formatTimestamp(timestamp)}
          </Text>
        </Group>

        <Card.Section withBorder inheritPadding py="sm">
          <Accordion variant="contained">
            <Accordion.Item value="details">
              <Accordion.Control>
                <Text size="sm" fw={500}>
                  Additional information
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                {additionalInfo ?? (
                  <Text size="sm" c="dimmed">
                    No additional information available.
                  </Text>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card.Section>
      </Stack>
    </Card>
  );
};

export default ServiceStatusCard;
