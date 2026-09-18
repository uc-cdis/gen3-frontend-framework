import React from 'react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@mantine/core';
import {
  selectAuthzMappingData,
  useCoreSelector,
  userHasMethodForServiceOnResource,
} from '@gen3/core';
import type { CoreState } from '@gen3/core';
import { NavPageLayout } from '../../../features/Navigation';
import type { NavPageLayoutProps } from '../../../features/Navigation';
import VLMDSubmissionTabbedPanel from '../../../features/DiscoveryForms/VLMDSubmission';
import type { VLMDSubmissionConfig } from '../../../features/DiscoveryForms/VLMDSubmission/types';

interface VLMDSubmissionPageProps extends NavPageLayoutProps {
  config: VLMDSubmissionConfig;
}

const VLMDSubmissionPage = ({
  headerProps,
  footerProps,
  config,
}: VLMDSubmissionPageProps): ReactElement => {
  const router = useRouter();
  const {
    studyUID,
    studyNumber,
    studyName,
    studyRegistrationAuthZ,
    disableCDESubmissionForm,
    existingDDNames,
    existingCDENames,
  } = router.query;

  const userAuthMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  const authZ =
    typeof studyRegistrationAuthZ === 'string' ? studyRegistrationAuthZ : '';

  const userHasAccessToSubmit = userHasMethodForServiceOnResource(
    'access',
    'study_registration',
    authZ,
    userAuthMapping,
  );

  const existingDataDictionaryNames =
    typeof existingDDNames === 'string'
      ? existingDDNames.split(',').filter(Boolean)
      : [];

  const existingCDENamesArr =
    typeof existingCDENames === 'string'
      ? existingCDENames.split(',').filter(Boolean)
      : [];

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'VLMD Submission',
        content: 'Variable Level Metadata Submission',
        key: 'vlmd-submission',
      }}
    >
      <div className="flex justify-items-center w-full">
        <Box className="w-full bg-white rounded-md m-8 p-8">
          <div className="max-w-4xl mx-auto">
            <VLMDSubmissionTabbedPanel
              studyUID={typeof studyUID === 'string' ? studyUID : undefined}
              studyNumber={typeof studyNumber === 'string' ? studyNumber : undefined}
              studyName={typeof studyName === 'string' ? studyName : undefined}
              studyRegistrationAuthZ={authZ || undefined}
              userHasAccessToSubmit={userHasAccessToSubmit}
              disableCDESubmissionForm={disableCDESubmissionForm === 'true'}
              config={config}
              existingDataDictionaryNames={existingDataDictionaryNames}
              existingCDENames={existingCDENamesArr}
            />
          </div>
        </Box>
      </div>
    </NavPageLayout>
  );
};

export default VLMDSubmissionPage;
