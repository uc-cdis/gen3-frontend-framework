import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { RepositoryConfiguration } from '../../features/CohortBuilder/Repository';
import { GEN3_COMMONS_NAME } from '@gen3/core';

import {
  AccessControlConfiguration,
  GuppyDataAccessMode,
} from '../../features/CohortBuilder/types';
import { RepositoryPageProps } from './types';

const DefaultHeaderMetadata = {
  title: 'Gen3 Repository Page',
  content: 'Repository Page',
  key: 'gen3-repository-page',
};

const DefaultAccessControlConfiguration: AccessControlConfiguration = {
  dataMode: GuppyDataAccessMode.REGULAR,
  tierLimit: -1,
  showAccessLevelControl: false,
};

export const RepositoryPageGetServerSideProps: GetServerSideProps<
  RepositoryPageProps
> = async () => {
  try {
    const repositoryConfiguration: RepositoryConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/repository.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),

        configuration: repositoryConfiguration,
        //  headerMetadata: cohortBuilderConfiguration.headerMetadata,
        accessControl: {
          ...DefaultAccessControlConfiguration,
        },
      },
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn('Explorer config cannot be read', err);
    }
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: undefined,
      },
    };
  }
};
