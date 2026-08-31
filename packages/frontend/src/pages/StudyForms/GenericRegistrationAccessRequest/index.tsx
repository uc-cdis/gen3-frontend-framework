// GenericRegistrationAccessRequestForm.tsx
import React from 'react';
import GenericRegistrationAccessRequestForm from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest';
import { NavPageLayout } from '../../../features/Navigation';
import type { GenericRegistrationAccessRequestFormConfig } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/types';
import type { NavPageLayoutProps } from '../../../features/Navigation';

interface GenericRegistrationAccessRequestFormPageProps extends NavPageLayoutProps {
  config: GenericRegistrationAccessRequestFormConfig;
}

const GenericRegistrationAccessRequestFormPage = ({
  headerProps,
  footerProps,
  config,
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
      <GenericRegistrationAccessRequestForm config={config} />
    </NavPageLayout>
  );
};

export default GenericRegistrationAccessRequestFormPage;
