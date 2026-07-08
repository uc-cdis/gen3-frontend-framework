import React, { JSX } from 'react';
import { Button, Modal, Text } from '@mantine/core';

interface SessionExpiringModalProps {
  readonly openModal: boolean;
  readonly minutesRemaining: number;
  readonly onRenew: () => void;
  readonly onLogout: () => void;
}

export const SessionExpiringModal = ({
  openModal,
  minutesRemaining,
  onRenew,
  onLogout,
}: SessionExpiringModalProps): JSX.Element => {
  return (
    <Modal
      opened={openModal}
      title={
        <Text size="lg" className="font-medium font-heading">
          Session Expiring Soon
        </Text>
      }
      onClose={onRenew}
      zIndex={400}
      size="60%"
      withinPortal={false}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
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
          onClick={onLogout}
          data-testid="button-session-expiring-logout"
        >
          Log out
        </Button>
        <Button
          onClick={onRenew}
          className="!bg-primary hover:!bg-primary-darker"
          data-testid="button-session-expiring-renew"
        >
          Renew Session
        </Button>
      </div>
    </Modal>
  );
};

export default SessionExpiringModal;
