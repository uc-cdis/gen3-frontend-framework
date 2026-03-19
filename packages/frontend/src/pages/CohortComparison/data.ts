import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type CohortComparisonConfiguration } from '../../features/CohortComparison/types';
import { type NavPageLayoutProps } from '../../features/Navigation';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { CohortComparisonPageProps } from './types';

const NullConfiguration: CohortComparisonConfiguration = {
  index: '',
  uniqueIdField: '',
  dataTypename: '',
  facets: [],
};

export const CohortComparisonServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (): Promise<GetServerSidePropsResult<CohortComparisonPageProps>> => {
  try {
    const configuration =
      await ContentSource.getContentDatabase().get<CohortComparisonConfiguration>(
        `${GEN3_COMMONS_NAME}/cohortComparison.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: configuration,
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error in Cohort Comparison data config';
    console.error(errorMessage);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: NullConfiguration,
      },
    };
  }
};
