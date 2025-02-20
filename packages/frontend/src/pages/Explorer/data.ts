import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import {
  CohortBuilderConfiguration,
  CohortBuilderProps,
} from '../../features/CohortBuilder';
import {
  GEN3_COMMONS_NAME,
  GEN3_GUPPY_API,
  fetchJSONDataFromURL,
  groupSharedFields,
  SharedFieldMapping,
} from '@gen3/core';
import type { NavPageLayoutProps } from '../../features/Navigation';

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps | CohortBuilderProps
> = async () => {
  try {
    const cohortBuilderConfiguration: CohortBuilderConfiguration =
      await ContentSource.get(`config/${GEN3_COMMONS_NAME}/explorer.json`);

    let sharedFiltersMap: SharedFieldMapping | undefined = undefined;

    if (cohortBuilderConfiguration?.sharedFilters) {
      if (cohortBuilderConfiguration?.sharedFilters?.autoCreate) {
        const indices = cohortBuilderConfiguration?.explorerConfig.map(
          (tab) => tab.guppyConfig.dataType,
        );

        try {
          const data = await fetchJSONDataFromURL(
            `${GEN3_GUPPY_API}/graphql`,
            true,
            'POST',
            { query: `{ _mapping { ${indices.join(' ')} }}`, variables: {} },
          );
          if ('_mapping' in data.data) {
            sharedFiltersMap = groupSharedFields(data.data['_mapping']);
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.warn('Unable to get mapping data from guppy');
          }
        }
      }
      if (cohortBuilderConfiguration?.sharedFilters?.defined) {
        sharedFiltersMap = cohortBuilderConfiguration?.sharedFilters?.defined;
      }
    }

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        sharedFiltersMap: sharedFiltersMap,
        tabsLayout: cohortBuilderConfiguration?.tabsLayout ?? 'left',
        explorerConfig: cohortBuilderConfiguration.explorerConfig,
      },
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn('Explorer config cannot be read', err);
    }
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        explorerConfig: undefined,
      },
    };
  }
};
