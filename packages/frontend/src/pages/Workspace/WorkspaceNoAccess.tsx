import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { NavPageLayoutProps } from '../../features/Navigation';
import { CardContainer } from '../../components/MessageCards';

const WorkspaceNoAccessPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): JSX.Element => {
  const supportEmail =
    headerProps?.siteProps?.contactEmail || 'support@datacommons.io';
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Workspace No Access Page',
        content: 'Workspace no access page',
        key: 'gen3-workspace-no-access-page',
      }}
    >
      <CardContainer>
        <h1>Error opening workspace...</h1>
        <p>
          Workspace access requires authorization. Please contact{' '}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a> for more
          information.
        </p>
      </CardContainer>
    </NavPageLayout>
  );
};

export default WorkspaceNoAccessPage;
