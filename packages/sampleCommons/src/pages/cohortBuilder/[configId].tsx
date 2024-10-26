import {
  ContentSource,
  getNavPageLayoutPropsFromConfig,
  NavPageLayout,
  NavPageLayoutProps,
} from '@gen3/frontend';

import React from 'react';
import { CohortBuilder, ExplorerPageProps } from '@gen3/frontend';
import { Center } from '@mantine/core';
import { GetServerSideProps } from 'next';
import { GEN3_COMMONS_NAME } from '@gen3/core';

const CohortBuilderPage = ({
  headerProps,
  footerProps,
  explorerConfig,
}: ExplorerPageProps): JSX.Element => {
  if (explorerConfig === undefined) {
    return (
      <Center maw={400} h={100} mx="auto">
        <div>Cohort config is not defined. Page disabled</div>
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
      <CohortBuilder explorerConfig={explorerConfig} />
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {
  const configId = context.query.configId as string;

  try {
    const config: any = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/cohortBuilder/${configId}.json`,
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        explorerConfig: config,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        explorerConfig: undefined,
      },
    };
  }
};

export default CohortBuilderPage;
