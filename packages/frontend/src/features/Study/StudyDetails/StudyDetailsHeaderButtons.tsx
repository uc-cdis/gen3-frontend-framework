import React, { useMemo } from 'react';
import { Button, CopyButton } from '@mantine/core';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { FiLogIn as LoginIcon } from 'react-icons/fi';
import {
  selectAuthzMappingData,
  selectUserDetails,
  useCoreSelector,
  userHasMethodForServiceOnResource,
} from '@gen3/core';
import type { CoreState, UserProfile } from '@gen3/core';
import { useDiscoveryContext } from '../../Discovery/DiscoveryProvider';
import { useRouter } from 'next/router';
import { useStudyContext } from '../StudyProvider';
import { toString } from 'lodash';
import { userCanRegisterStudy } from '../../DiscoveryForms/StudyRegistration/userCanRegisterStudy';
import type { CoreState, UserProfile } from '@gen3/core';
interface StudyDetailsHeaderButtonsProps {
  onClose: () => void;
  permalink: string;
}

const StudyDetailsHeaderButtons: React.FC<StudyDetailsHeaderButtonsProps> = ({
  onClose,
  permalink,
}) => {
  type ActiveUser = Partial<UserProfile> & { active: boolean };
  const userInfo = useCoreSelector(
    (state: CoreState) => selectUserDetails(state) as ActiveUser,
  );
  const requiresLogin = !userInfo.active;
  const { discoveryConfig: config } = useDiscoveryContext();
  const router = useRouter();
  const index = config.minimalFieldMapping.uid;
  const { studyDetails } = useStudyContext();
  const studyUID = toString(studyDetails[index]);
  const studyName = studyDetails.study_metadata?.minimal_info?.study_name;
  const studyRegistrationAuthZ = studyDetails.registration_authz;
  const studyProjectNumber = studyDetails.project_number;
  const showSubmitButton = config.detailView.showSubmitButton;

  const userAuthMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  const userHasStudyRegistrationAccess = userHasMethodForServiceOnResource(
    'access',
    'study_registration',
    toString(studyRegistrationAuthZ),
    userAuthMapping,
  );

  const isStudyRegistered = studyDetails.is_registered;

  // Study is not yet registered — show register/request-access/login button
  const showStudyRegistrationButton =
    showSubmitButton && isStudyRegistered === false;

  // Study is registered — show appropriate VLMD submission button based on auth state
  const showSubmitVLMDButton =
    showSubmitButton &&
    isStudyRegistered &&
    !requiresLogin &&
    userHasStudyRegistrationAccess;

  const showRequestVLMDAccessButton =
    showSubmitButton &&
    isStudyRegistered &&
    !requiresLogin &&
    !userHasStudyRegistrationAccess;

  const showLoginToSubmitVLMDButton =
    showSubmitButton && isStudyRegistered && requiresLogin;

  const studyNavQuery = {
    studyUID,
    studyName,
    studyRegistrationAuthZ: toString(studyRegistrationAuthZ),
    studyProjectNumber,
  };

  const handleStudyRegistrationClick = () => {
    if (requiresLogin) {
      void router.push('/Login');
    } else if (userHasStudyRegistrationAccess) {
      void router.push(
        { pathname: '/study-reg', query: studyNavQuery },
        '/study-reg',
      );
    } else {
      void router.push(
        { pathname: '/study-reg/request-access', query: studyNavQuery },
        '/study-reg/request-access',
      );
    }
  };

  const handleSubmitVLMDClick = () => {
    void router.push(
      { pathname: '/vlmd-submission', query: studyNavQuery },
      '/vlmd-submission',
    ); 
  };

  const handleRequestVLMDAccessClick = () => {
    void router.push(
      { pathname: '/vlmd-submission/request-access', query: studyNavQuery },
      '/vlmd-submission/request-access',
    );
  };

  const studyRegistrationButtonText = useMemo(() => {
    if (requiresLogin) return 'Login to Register This Study';
    if (userHasStudyRegistrationAccess) return 'Register This Study';
    return 'Request Access to Register This Study';
  }, [requiresLogin, userHasStudyRegistrationAccess]);

  return (
    <>
      <Button leftSection={<BackIcon />} onClick={onClose} variant="outline">
        Back
      </Button>
      {showStudyRegistrationButton && (
        <Button
          leftSection={<LoginIcon size={14} />}
          variant="subtle"
          color="black"
          size="xs"
          onClick={handleStudyRegistrationClick}
        >
          {studyRegistrationButtonText}
        </Button>
      )}
      {showSubmitVLMDButton && (
        <Button
          leftSection={<LoginIcon size={14} />}
          variant="subtle"
          color="black"
          size="xs"
          onClick={handleSubmitVLMDClick}
        >
          Submit Variable-level Metadata
        </Button>
      )}
      {showRequestVLMDAccessButton && (
        <Button
          leftSection={<LoginIcon size={14} />}
          variant="subtle"
          color="black"
          size="xs"
          onClick={handleRequestVLMDAccessClick}
        >
          Request Access to Submit Variable-level Metadata
        </Button>
      )}
      {showLoginToSubmitVLMDButton && (
        <Button
          leftSection={<LoginIcon size={14} />}
          variant="subtle"
          color="black"
          size="xs"
          onClick={() => void router.push('/login')}
        >
          Login to Submit Variable-level Metadata
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
