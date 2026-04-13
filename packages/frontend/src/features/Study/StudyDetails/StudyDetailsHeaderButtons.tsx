import React from 'react';
import { Button, CopyButton } from '@mantine/core';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { useStudyContext } from '../StudyProvider';
import { FiLogIn as LoginIcon } from 'react-icons/fi';
import { useIsUserLoggedIn } from '@gen3/core';

interface StudyDetailsHeaderButtonsProps {
  studyIndex: string;
}
const StudyDetailsHeaderButtons: React.FC<StudyDetailsHeaderButtonsProps> = ({
  studyIndex,
}) => {
  // Note: This doesn't seem to work, will be addressed in HP-2384
  let permalink = 'Discovery/notfound';
  const { studyDetails } = useStudyContext();
  if (studyDetails) {
    const studyId = studyDetails[studyIndex];
    const pagePath = `/discovery/${encodeURIComponent(
      typeof studyId == 'string' ? 'string' : 'unknown',
    )}`;
    permalink = `/${pagePath}`;
  }
  const requiresLogin = !useIsUserLoggedIn();
  alert(`requiresLogin: ${requiresLogin}`);
  return (
    <>
      <Button leftSection={<BackIcon />} onClick={close} variant="outline">
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
