import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { QueryConfiguration, QueryPageLayoutProps } from './types';
import { GEN3_COMMONS_NAME } from '@gen3/core';

const DEFAULT_QUERY_CONFIGURATION = {
  graphQLEndpoints: [{ url: 'guppy/graphql', label: 'Flat' }],
};

export const QueryPageGetServerSideProps: GetServerSideProps<
  QueryPageLayoutProps
> = async () => {
  try {
    const queryConfiguration: QueryConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/query.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: queryConfiguration,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('Error fetching query configuration:', error.message);
      console.warn('Returning default configuration');
    }
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: DEFAULT_QUERY_CONFIGURATION,
      },
    };
  }
};
