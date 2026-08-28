// GenericRegistrationAccessRequestForm.tsx
import React from 'react';
import GenericRegistrationAccessRequestForm from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest';
import { NavPageLayout } from '../../../features/Navigation';
import type { GenericRegistrationAccessRequestFormConfig } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/types';
import type { NavPageLayoutProps } from '../../../features/Navigation';

interface GenericRegistrationAccessRequestFormPageProps extends NavPageLayoutProps {
  configStudyRegistrationRequestAccessForm: GenericRegistrationAccessRequestFormConfig;
  studyName: string;
}

const GenericRegistrationAccessRequestFormPage = ({
  headerProps,
  footerProps,
  configStudyRegistrationRequestAccessForm,
}: GenericRegistrationAccessRequestFormPageProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Theme Page',
        content: 'Theme page',
        key: 'gen3-theme-page',
      }}
    >
      <GenericRegistrationAccessRequestForm
        configStudyRegistrationRequestAccessForm={
          configStudyRegistrationRequestAccessForm
        }
      />
    </NavPageLayout>
  );
};

export default GenericRegistrationAccessRequestFormPage;
