import React, { useEffect, useState } from 'react';
import { Button, CopyButton } from '@mantine/core';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { useStudyContext } from '../StudyProvider';
import { FiLogIn as LoginIcon } from 'react-icons/fi';
import { useIsUserLoggedIn } from '@gen3/core';

interface StudyDetailsHeaderButtonsProps {
  //studyIndex: string;
  onClose: () => void;
  // opened: boolean;
  permalink: string;
}
const StudyDetailsHeaderButtons: React.FC<StudyDetailsHeaderButtonsProps> = ({
  //studyIndex,
  onClose,
  //opened,
  permalink,
}) => {
  // Note: This doesn't seem to work, will be addressed in HP-2384
  const { studyDetails, setStudyDetails } = useStudyContext();

  const requiresLogin = !useIsUserLoggedIn();

  return (
    <>
      <Button leftSection={<BackIcon />} onClick={onClose} variant="outline">
        Back
      </Button>
      <Button leftSection={<LoginIcon size={14} />} variant="subtle">
        {requiresLogin
          ? 'Login to submit variable level metadata'
          : 'Request Access to Submit Variable-level Metadata'}
      </Button>
      <CopyButton value={permalink}>
        {({ copied, copy }) => (
          <Button color={copied ? 'primary' : 'secondary'} onClick={copy}>
            {copied ? 'Copied Permalink' : 'Permalink'}
          </Button>
        )}
      </CopyButton>
    </>
  );
};
export default StudyDetailsHeaderButtons;
