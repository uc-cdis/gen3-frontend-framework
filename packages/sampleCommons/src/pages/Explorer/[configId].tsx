import {
  ContentSource,
  getNavPageLayoutPropsFromConfig,
  ExplorerPageGetServerSidePropsForConfigId,
  NavPageLayout,
  NavPageLayoutProps,
} from '@gen3/frontend';

import React from 'react';
import {
  CohortBuilder,
  ExplorerPageProps,
  ExplorerPageGetServerSidePropsForConfigId as getServerSideProps,
} from '@gen3/frontend';
import { Center } from '@mantine/core';

const CohortBuilderPage = ({
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
        title: 'Gen3 Cohort Builder Page',
        content: 'Cohort Builder',
        key: 'gen3-cohort-builder-page',
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

export default CohortBuilderPage;
