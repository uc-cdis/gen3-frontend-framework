import React, { useCallback } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { Button } from '@mantine/core';
import { useSession } from '../../lib/session/session';

export interface SessionInactivityModalProps {
  inactiveWarningTimeLimitMilliseconds: number;
}

const calculateMinRemaining = (inactivityWarningTime: number) => {
  const minRemain = Math.ceil((inactivityWarningTime - Date.now()) / 60000);
  return [
    `Due to inactivity, your session will expire in ${minRemain} minute${minRemain > 1 ? 's' : ''}`,
  ];
};

export const SessionInactivityModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<SessionInactivityModalProps>) => {
  const { inactiveWarningTimeLimitMilliseconds } = innerProps;

  const { endSession } = useSession();

  const handleLogout = useCallback(() => {
    endSession();
  }, [endSession]);

  const message = calculateMinRemaining(
    inactiveWarningTimeLimitMilliseconds || Date.now(),
  );
  return (
    <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
      <p>{message}</p>
      <div className="flex justify-end mt-2.5 gap-2 p-4">
        <Button
          data-testid="button-intro-warning-accept"
          onClick={handleLogout}
          className="!bg-primary hover:!bg-primary-darker"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
