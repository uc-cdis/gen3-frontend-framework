import React, { ReactElement, useCallback } from 'react';
import { Modal, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { BaseModal } from '../Modals';

const JobsModal = ({ openModal }: { openModal: boolean }): ReactElement => {
  const router = useRouter();
  const onLogout = useCallback(() => {
    router.push('/Login');
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
        <p>Jobs</p>
      </div>
    </BaseModal>
  );
};

export default JobsModal;
