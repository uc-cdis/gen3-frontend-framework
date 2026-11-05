import { NavPageLayout } from '@gen3/frontend/features/Navigation';

import React, { JSX } from 'react';
import CohortBuilder from '@gen3/frontend/features/CohortBuilder/CohortBuilder';
import { ExplorerPageProps } from '@gen3/frontend/pages/Explorer/types';
import { ExplorerPageGetServerSidePropsForConfigId as getServerSideProps } from '@gen3/frontend/pages/Explorer/data';
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
      headerMetadata={{
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

export { getServerSideProps };
