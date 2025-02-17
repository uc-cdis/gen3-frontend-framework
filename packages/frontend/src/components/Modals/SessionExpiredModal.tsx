import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@mantine/core';
import { BaseModal } from './BaseModal';
import { SessionExpiredModalConfig } from "./types";

interface SessionExpiredModalProps {
  readonly openModal: boolean;
  config: SessionExpiredModalConfig | undefined;
}
export const SessionExpiredModal = ({
  openModal,
  config
}: SessionExpiredModalProps): JSX.Element => {

  const router = useRouter();
  const onLogout = useCallback(() => {
    router.push(config?.externalLoginUrl || '/Login');
  }, [router]);

  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          Session Timeout
        </Text>
      }
      openModal={openModal}
      size="60%"
      buttons={[
        {
          title: 'Login',
          onClick: onLogout,
          hideModalOnClick: true,
          dataTestId: 'button-session-timeout-logout',
        },
      ]}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
        <p>
          Your session has expired or you are logged out. Please log in to
          continue.
        </p>
      </div>
    </BaseModal>
  );
};
