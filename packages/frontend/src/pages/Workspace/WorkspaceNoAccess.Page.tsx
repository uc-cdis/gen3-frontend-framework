import React, { JSX } from 'react';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { CardContainer } from '../../components/MessageCards';
import { Center } from '@mantine/core';

const WorkspaceNoAccessPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): JSX.Element => {
  const supportEmail =
    headerProps?.siteProps?.contactEmail || 'support@gen3.org';
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Workspace No Access Page',
        content: 'Workspace no access page',
        key: 'gen3-workspace-no-access-page',
      }}
    >
      <Center maw={400} h={100} mx="auto">
        <CardContainer>
          <h1>Error opening workspace...</h1>
          <p>
            Workspace access requires authorization. Please contact{' '}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a> for more
            information.
          </p>
        </CardContainer>
      </Center>
    </NavPageLayout>
  );
};

export default WorkspaceNoAccessPage;
