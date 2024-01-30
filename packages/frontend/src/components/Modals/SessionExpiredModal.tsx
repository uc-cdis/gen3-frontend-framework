import { Text } from '@mantine/core';
import { BaseModal } from './BaseModal';

export const SessionExpiredModal = ({
  openModal,
  onLogout,
}: {
  openModal: boolean;
  onLogout: () => void;
}): JSX.Element => {
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
          title: 'Logout',
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
