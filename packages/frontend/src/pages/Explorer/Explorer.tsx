import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { CohortBuilder } from '../../features/CohortBuilder';
import { ExplorerPageProps } from './types';
import { Center } from '@mantine/core';

const ExplorerPage = ({
  headerProps,
  footerProps,
  explorerConfig,
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
      headerData={{
        title: 'Gen3 Explorer Page',
        content: 'Explorer Page',
        key: 'gen3-explorer-page',
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
