import React, { useMemo } from 'react';
import { Button, CopyButton } from '@mantine/core';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { FiLogIn as LoginIcon } from 'react-icons/fi';
import { CoreState, selectUserAuthStatus, useCoreSelector } from '@gen3/core';
import { useDiscoveryContext } from '../../Discovery/DiscoveryProvider';
import { useRouter } from 'next/router';
import { useStudyContext } from '../StudyProvider';
import { toString } from 'lodash';

interface StudyDetailsHeaderButtonsProps {
  onClose: () => void;
  permalink: string;
  userStatus: string;
}
const StudyDetailsHeaderButtons: React.FC<StudyDetailsHeaderButtonsProps> = ({
  onClose,
  permalink,
  userStatus,
}) => {
  const requiresLogin = userStatus !== 'authenticated';
  const { discoveryConfig: config } = useDiscoveryContext();
  const index = config?.minimalFieldMapping?.uid ?? 'unknown';
  const { studyDetails, setStudyDetails } = useStudyContext();
  const studyUID = toString(studyDetails[index]);
  const studyName = studyDetails.study_metadata.minimal_info
    .study_name as string;

  console.log('studyDetails', studyDetails);
  const showSubmitButton = config.detailView?.showSubmitButton;
  const router = useRouter();

  const handleRegisterButtonClick = () => {
    if (requiresLogin) {
      router.push('/Login');
    } else {
      router.push(
        {
          pathname: '/study-reg/request-access',
          query: {
            studyUID: studyUID,
            studyName: studyName,
            studyRegistrationAuthZ: 'studyRegistrationAuthZ from Button',
          },
        },
        '/study-reg/request-access',
      );
    }
  };

  const submitButtonText = useMemo(() => {
    if (requiresLogin) {
      return 'Login to Register This Study';
    }
    return `Request Access to Register this Study`;
  }, [requiresLogin, studyUID]);

  return (
    <>
      <Button leftSection={<BackIcon />} onClick={onClose} variant="outline">
        Back
      </Button>
      {showSubmitButton && (
        <Button
          leftSection={<LoginIcon size={14} />}
          variant="subtle"
          color="black"
          size="xs"
          onClick={handleRegisterButtonClick}
        >
          {submitButtonText}
        </Button>
      )}
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
