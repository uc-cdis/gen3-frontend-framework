import React, { JSX } from 'react';
import dynamic from 'next/dynamic';
import { NavPageLayout } from '../../features/Navigation';
import { ExplorerPageProps } from './types';
import { Center } from '@mantine/core';

const CohortBuilder = dynamic(
  () => import('../../features/CohortBuilder/CohortBuilder'),
  {
    ssr: false,
  },
);

const ExplorerPage = ({
  headerProps,
  footerProps,
  explorerConfig,
  headerMetadata,
  tabsLayout,
  sharedFiltersMap,
}: ExplorerPageProps): JSX.Element => {
  if (explorerConfig === undefined) {
    return (
      <Center maw={400} h={100} mx="auto">
        <div>Explorer config is not defined. Page disabled</div>
      </Center>
    );
  }

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Explorer Page',
        content: 'Explorer Page',
        key: 'gen3-explorer-page',
        ...(headerMetadata ? headerMetadata : {}),
      }}
    >
      <CohortBuilder
        tabsLayout={tabsLayout}
        explorerConfig={explorerConfig}
        sharedFiltersMap={sharedFiltersMap}
      />
    </NavPageLayout>
  );
};

export default ExplorerPage;
