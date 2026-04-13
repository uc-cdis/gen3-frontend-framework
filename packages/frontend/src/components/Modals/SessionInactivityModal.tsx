import React, { useCallback } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { Button } from '@mantine/core';

export interface SessionInactivityModalProps {
  remainingTimeMilliseconds: number;
  endSession: () => void;
  extendSession: () => void;
}

const calculateMinRemaining = (remainingTime: number) => {
  const minRemain = Math.ceil(remainingTime / 60000);
  return [
    `Due to inactivity, your session will expire in ${minRemain} minute${minRemain > 1 ? 's' : ''}`,
  ];
};

export const SessionInactivityModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<SessionInactivityModalProps>) => {
  const { remainingTimeMilliseconds, endSession, extendSession } = innerProps;

  const handleLogout = useCallback(() => {
    endSession();
    context.closeModal(id);
  }, [context, endSession, id]);

  const handleExtendSession = useCallback(() => {
    extendSession();
    context.closeModal(id);
  }, [context, extendSession, id]);

  const message = calculateMinRemaining(remainingTimeMilliseconds);
  return (
    <div className="py-4 space-y-4 font-content">
      <p>{message}</p>
      <div className="flex justify-end mt-2.5 gap-2 p-4">
        <Button
          data-testid="button-inactive_warning-logout"
          onClick={handleLogout}
          className="!bg-primary hover:!bg-primary-darker"
        >
          Logout
        </Button>
        <Button
          data-testid="button-inactive_warning-extend"
          onClick={handleExtendSession}
          className="!bg-primary hover:!bg-primary-darker"
        >
          Extend
        </Button>
      </div>
    </div>
  );
};
