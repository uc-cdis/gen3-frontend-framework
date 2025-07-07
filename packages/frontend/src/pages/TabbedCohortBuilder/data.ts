import { GetServerSideProps } from 'next';
import ContentSource from '../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { TabbedCohortBuilderConfiguration } from '../../features/CohortBuilder/TabbedCohortBuilder';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { TabbedCohortBuilderPageProps } from './types';

export const TabbedCohortBuilderPageGetServerSideProps: GetServerSideProps<
  TabbedCohortBuilderPageProps
> = async () => {
  try {
    const cohortBuilderConfiguration: TabbedCohortBuilderConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/tabbedCohortBuilder.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: cohortBuilderConfiguration,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: {
          tabsConfiguration: {},
          index: 'unset',
        },
      },
    };
  }
};
