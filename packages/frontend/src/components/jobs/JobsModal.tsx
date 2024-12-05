import React, { ReactElement } from 'react';
import { Text } from '@mantine/core';
import { BaseModal } from '../Modals';
import JobsList from './JobsList';

const JobsModal = ({ openModal }: { openModal: boolean }): ReactElement => {
  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          File Processing Jobs
        </Text>
      }
      openModal={openModal}
      withCloseButton={true}
      closeOnClickOutside={false}
      closeOnEscape={true}
      size="auto"
    >
      <div className="flex flex-col border-y border-y-base-darker py-4 space-y-4 font-content">
        <JobsList />
      </div>
    </BaseModal>
  );
};

export default JobsModal;
