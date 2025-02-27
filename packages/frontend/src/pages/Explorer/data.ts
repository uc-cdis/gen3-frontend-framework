import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import {
  CohortBuilderConfiguration,
  CohortBuilderProps,
  CohortPanelConfig,
} from '../../features/CohortBuilder';
import {
  GEN3_COMMONS_NAME,
  GEN3_GUPPY_API,
  fetchJSONDataFromURL,
  groupSharedFields,
  SharedFieldMapping,
} from '@gen3/core';
import { isArray } from 'lodash';
import type { NavPageLayoutProps } from '../../features/Navigation';

const GetSharedFieldMapping = async (
  cohortBuilderConfiguration: CohortBuilderConfiguration,
) => {
  let sharedFiltersMap: SharedFieldMapping | null = null;

  if (cohortBuilderConfiguration?.sharedFilters) {
    // have shared filters defined
    if (cohortBuilderConfiguration?.sharedFilters?.autoCreate) {
      // create shared filter from Gen3 graphql mapping
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
          console.warn('Unable to get mapping data from guppy:', err);
        }
      }
    }
    if (cohortBuilderConfiguration?.sharedFilters?.defined) {
      sharedFiltersMap = cohortBuilderConfiguration?.sharedFilters?.defined; // manually defined mapping
    }
    if (sharedFiltersMap) {
      const indexToAlias = Object.values(
        cohortBuilderConfiguration?.explorerConfig,
      ).reduce((acc: Record<string, string>, panel: CohortPanelConfig) => {
        acc[panel.guppyConfig.dataType] = panel.tabTitle;
        return acc;
      }, {});

      const updatedSharedFiltersMap: SharedFieldMapping = {};
      for (const [field, values] of Object.entries(sharedFiltersMap)) {
        updatedSharedFiltersMap[field] = values.map((x) => ({
          ...x,
          indexAlias: indexToAlias[x.index],
        }));
      }
      sharedFiltersMap = updatedSharedFiltersMap;
    }
  }

  return sharedFiltersMap;
};

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps | CohortBuilderProps
> = async () => {
  try {
    const cohortBuilderConfiguration: CohortBuilderConfiguration =
      await ContentSource.get(`config/${GEN3_COMMONS_NAME}/explorer.json`);

    if (isArray(cohortBuilderConfiguration)) {
      // older config layout
      // TODO: remove this
      return {
        props: {
          ...(await getNavPageLayoutPropsFromConfig()),
          explorerConfig: cohortBuilderConfiguration,
        },
      };
    }

    const sharedFiltersMap = await GetSharedFieldMapping(
      cohortBuilderConfiguration,
    );

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

export const ExplorerPageGetServerSidePropsForConfigId: GetServerSideProps<
  NavPageLayoutProps | CohortBuilderProps
> = async (context) => {
  const configId = context.query.configId as string;

  try {
    const cohortBuilderConfiguration: CohortBuilderConfiguration =
      await ContentSource.get(
        `config/${GEN3_COMMONS_NAME}/explorer/${configId}.json`,
      );

    if (isArray(cohortBuilderConfiguration)) {
      // older config layout
      // TODO: remove this
      return {
        props: {
          ...(await getNavPageLayoutPropsFromConfig()),
          explorerConfig: cohortBuilderConfiguration,
        },
      };
    }

    const sharedFiltersMap = await GetSharedFieldMapping(
      cohortBuilderConfiguration,
    );

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
