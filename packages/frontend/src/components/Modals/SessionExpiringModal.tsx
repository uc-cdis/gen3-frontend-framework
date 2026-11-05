import React, { JSX } from 'react';
import { Button } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';

export interface SessionExpiringModalProps {
  readonly minutesRemaining: number;
  readonly onRenew: () => void;
  readonly onLogout: () => void;
}

export const SessionExpiringModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<SessionExpiringModalProps>): JSX.Element => {
  const { minutesRemaining, onRenew, onLogout } = innerProps;

  return (
    <>
      <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
        <p>
          Your session will expire in {minutesRemaining} minute
          {minutesRemaining !== 1 ? 's' : ''}. Would you like to renew your
          session?
        </p>
      </div>
      <div className="flex justify-end mt-2.5 gap-2">
        <Button
          variant="outline"
          onClick={() => {
            onLogout();
            context.closeModal(id);
          }}
          data-testid="button-session-expiring-logout"
        >
          Log out
        </Button>
        <Button
          onClick={() => {
            onRenew();
            context.closeModal(id);
          }}
          className="!bg-primary hover:!bg-primary-darker"
          data-testid="button-session-expiring-renew"
        >
          Renew Session
        </Button>
      </div>
    </>
  );
};

export default SessionExpiringModal;
