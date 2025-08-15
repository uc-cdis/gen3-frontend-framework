import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { RepositoryPageProps } from './types';
import { Center } from '@mantine/core';
import { Repository } from '../../features/CohortBuilder';

const RepositoryPage = ({
  headerProps,
  footerProps,
  configuration,
  headerMetadata,
}: RepositoryPageProps): JSX.Element => {
  if (configuration === undefined) {
    return (
      <Center maw={400} h={100} mx="auto">
        <div>Repository config is not defined. Page disabled</div>
      </Center>
    );
  }

  console.log('RepositoryPage', configuration);
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Repository Page',
        content: 'Repository Page',
        key: 'gen3-repository-page',
        ...(headerMetadata ? headerMetadata : {}),
        ...(configuration?.headerMetadata ? configuration.headerMetadata : {}),
      }}
    >
      <Repository {...configuration} />
    </NavPageLayout>
  );
};

export default RepositoryPage;
