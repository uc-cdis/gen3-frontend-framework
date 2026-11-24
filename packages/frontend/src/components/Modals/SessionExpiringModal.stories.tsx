import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import type { SessionExpiringModalProps } from './SessionExpiringModal';

const MODAL_KEY = 'sessionExpiringModal';

interface ModalLauncherProps extends SessionExpiringModalProps {
  autoOpen?: boolean;
}

const ModalLauncher = ({
  autoOpen = true,
  ...innerProps
}: ModalLauncherProps) => {
  const open = () =>
    modals.openContextModal({
      modal: MODAL_KEY,
      title: 'Session Expiring',
      withCloseButton: true,
      closeOnClickOutside: false,
      closeOnEscape: false,
      innerProps,
    });

  useEffect(() => {
    if (autoOpen) open();
    return () => modals.closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Button onClick={open}>Open session expiring modal</Button>;
};

const meta = {
  component: ModalLauncher,
  // Each story auto-opens a modal, so a combined Docs page would open them all at once.
  tags: ['!autodocs'],
  args: {
    minutesRemaining: 8,
    maxMinutes: 10,
    onRenew: () => console.warn('Session renewed'),
    onLogout: () => console.warn('Logged out'),
  },
} satisfies Meta<typeof ModalLauncher>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Plenty of time left. */
export const Calm: Story = {};

/** Five minutes or less remaining. */
export const Soon: Story = {
  args: { minutesRemaining: 4 },
};

/** Two minutes or less remaining. */
export const Critical: Story = {
  args: { minutesRemaining: 1 },
};
