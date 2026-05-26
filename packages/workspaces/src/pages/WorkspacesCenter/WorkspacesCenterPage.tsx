import { WorkspacesPageLayoutProps } from './types';
import React, { JSX } from 'react';
import { NavPageLayout } from '@gen3/frontend';
import TierSelectorLanding from '@/components/TierSelectorLanding';

const WorkspacesCenterPage = ({
  headerProps,
  footerProps,
  configuration,
}: WorkspacesPageLayoutProps): JSX.Element => {
  console.log('configuration', configuration);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Workspace Page',
        content: 'Workspace page',
        key: 'gen3-workspace-page',
        ...(configuration?.headerMetadata ? configuration.headerMetadata : {}),
      }}
    >
      <TierSelectorLanding
        cards={configuration?.workspaces}
        onSelectTier={(tier) => {}}
        label={configuration?.landingPage?.label}
        description={configuration?.landingPage?.description}
        additionalDescriptions={
          configuration?.landingPage?.additionalDescriptions
        }
        classNames={configuration?.landingPage?.classNames}
      />
    </NavPageLayout>
  );
};

export default WorkspacesCenterPage;
