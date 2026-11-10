import type { JSX } from 'react';
import React from 'react';
import type { ContextModalProps } from '@mantine/modals';
import SessionExpiringPanel from './SessionExpiringPanel';

export interface SessionExpiringModalProps {
  minutesRemaining: number;
  maxMinutes: number;
  onRenew: () => void;
  onLogout: () => void;
}

export const SessionExpiringModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<Readonly<SessionExpiringModalProps>>): JSX.Element => {
  const { minutesRemaining, onRenew, onLogout, maxMinutes } = innerProps;

  return (
    <SessionExpiringPanel
      remainingMinutes={minutesRemaining}
      maxMinutes={maxMinutes}
      onLogout={() => {
        onLogout();
        context.closeModal(id);
      }}
      onRenew={() => {
        onRenew();
        context.closeModal(id);
      }}
    />
  );
};

export default SessionExpiringModal;
