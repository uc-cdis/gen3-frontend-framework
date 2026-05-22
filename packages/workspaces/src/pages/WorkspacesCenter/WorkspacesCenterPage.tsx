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
      />
    </NavPageLayout>
  );
};

export default WorkspacesCenterPage;
