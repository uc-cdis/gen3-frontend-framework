import React, { useCallback } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { useRouter } from 'next/router';
import { SessionInactivityModalConfiguration } from './types';
import { Button } from '@mantine/core';

export interface SessionInactivityModalProps {
  configuration: SessionInactivityModalConfiguration | undefined;
  inactivityWarningTime: number;
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
  const { configuration, inactivityWarningTime } = innerProps;
  const router = useRouter();
  const handleLogout = useCallback(() => {
    router.push(configuration?.externalLoginUrl || '/Login');
  }, [configuration?.externalLoginUrl, router]);

  const message = calculateMinRemaining(inactivityWarningTime || Date.now());
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
