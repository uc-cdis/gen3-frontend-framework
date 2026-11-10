import React from 'react';
import { Button, Group, Paper, RingProgress, Stack, Text } from '@mantine/core';

export interface SessionExpiringPanelProps {
  /** Minutes left before the session expires. Fractions are allowed. */
  remainingMinutes: number;
  /** Total length of the warning window. Defaults to 10. */
  maxMinutes?: number;
  /** Called when the user chooses to keep working. */
  onRenew?: () => void;
  /** Called when the user chooses to end the session now. */
  onLogout?: () => void;
  /** Disables the buttons, e.g. while a refresh request is in flight. */
  loading?: boolean;
}

type Urgency = 'calm' | 'soon' | 'critical';

const URGENCY_STYLES: Record<
  Urgency,
  { color: string; title: string; hint: string }
> = {
  calm: {
    color: 'var(--mantine-color-utility-0)',
    title: 'Your session is expiring',
    hint: 'Renew session to keep working without interruption.',
  },
  soon: {
    color: 'var(--mantine-color-utility-2)',
    title: 'You session expiring soon',
    hint: 'Renew session soon to keep working without interruption.',
  },
  critical: {
    color: 'var(--mantine-color-utility-3)',
    title: 'Your session about to end',
    hint: 'Unsaved changes will be lost when the session ends.',
  },
};

const getUrgency = (minutes: number): Urgency => {
  if (minutes <= 2) return 'critical';
  if (minutes <= 5) return 'soon';
  return 'calm';
};

const SessionExpiringPanel: React.FC<SessionExpiringPanelProps> = ({
  remainingMinutes,
  maxMinutes = 10,
  onRenew,
  onLogout,
  loading = false,
}) => {
  const clamped = Math.min(Math.max(remainingMinutes, 0), maxMinutes);
  const percent = maxMinutes > 0 ? (clamped / maxMinutes) * 100 : 0;
  const urgency = getUrgency(clamped);
  const { color, title, hint } = URGENCY_STYLES[urgency];

  // Show whole minutes, rounding up so "0" only appears once the session is over.
  const displayMinutes = Math.ceil(clamped);
  const unit = displayMinutes === 1 ? 'minute' : 'minutes';
  const expired = clamped <= 0;

  return (
    <Paper
      withBorder
      radius="xs"
      p="lg"
      role="alert"
      style={{
        //  borderLeft: `6px solid var(--mantine-color-accent-4)`,
        transition: 'border-color 300ms ease',
      }}
    >
      <Group wrap="nowrap" gap="lg" align="center" classNames={{ root: 'p-2' }}>
        <RingProgress
          size={145}
          thickness={12}
          roundCaps
          sections={[{ value: percent, color: `${color}` }]}
          rootColor="var(--mantine-color-accent-2)"
          aria-label={`${displayMinutes} ${unit} remaining of ${maxMinutes}`}
          label={
            <Stack gap={0} align="center">
              <Text fz={34} fw={700} lh={1} c={`${color}`}>
                {displayMinutes}
              </Text>
              <Text fz="xs" c="dimmed" mt={4}>
                {unit} left
              </Text>
            </Stack>
          }
        />

        <Stack gap="xs" style={{ flex: 1 }}>
          <div>
            <Text fw={600} fz="lg" lh={1.2}>
              {expired ? 'Session expired' : title}
            </Text>
            <Text fz="sm" c="dimmed" mt={4}>
              {expired ? 'Sign in again to continue.' : hint}
            </Text>
          </div>

          <Group
            wrap="nowrap"
            gap="xs"
            mt="xs"
            justify="end"
            classNames={{ root: 'mt-6' }}
          >
            {!expired && (
              <Button
                color={color}
                size="sm"
                onClick={onRenew}
                disabled={loading}
                loading={loading}
              >
                Extend session
              </Button>
            )}
            <Button
              color={expired ? color : 'gray'}
              size="sm"
              onClick={onLogout}
              disabled={loading}
            >
              {expired ? 'Login' : 'Logoff'}
            </Button>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
};

export default SessionExpiringPanel;
