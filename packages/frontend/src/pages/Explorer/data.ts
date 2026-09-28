import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import {
  CohortBuilderConfiguration,
  CohortBuilderProps,
  CohortPanelConfiguration,
} from '../../features/CohortBuilder';
import {
  fetchJSONDataFromURL,
  GEN3_COMMONS_NAME,
  GEN3_GUPPY_API,
  groupSharedFields,
  HttpMethod,
  SharedFieldMapping,
} from '@gen3/core';
import { isArray } from 'lodash';
import type { NavPageLayoutProps } from '../../features/Navigation';
import {
  AccessControlConfiguration,
  GuppyDataAccessMode,
} from '../../features/CohortBuilder/types';

const DefaultHeaderMetadata = {
  title: 'Gen3 Explorer Page',
  content: 'Explorer Page',
  key: 'gen3-explorer-page',
};

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
        const data = await fetchJSONDataFromURL<any>(
          `${GEN3_GUPPY_API}/graphql`,
          true,
          HttpMethod.POST,
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
      ).reduce(
        (acc: Record<string, string>, panel: CohortPanelConfiguration) => {
          acc[panel.guppyConfig.dataType] = panel.tabTitle;
          return acc;
        },
        {},
      );

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

const DefaultAccessControlConfiguration: AccessControlConfiguration = {
  dataMode: GuppyDataAccessMode.REGULAR,
  tierLimit: -1,
  showAccessLevelControl: false,
};

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps | CohortBuilderProps
> = async () => {
  try {
    const cohortBuilderConfiguration: CohortBuilderConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/explorer.json`,
      );

    if (isArray(cohortBuilderConfiguration)) {
      // older config layout
      // TODO: remove this
      return {
        props: {
          ...(await getNavPageLayoutPropsFromConfig()),
          explorerConfig: cohortBuilderConfiguration,
          headerMetadata: cohortBuilderConfiguration?.headerMetadata
            ? cohortBuilderConfiguration.headerMetadata
            : DefaultHeaderMetadata,
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
        //  headerMetadata: cohortBuilderConfiguration.headerMetadata,
        accessControl: {
          ...DefaultAccessControlConfiguration,
          ...cohortBuilderConfiguration.accessControl,
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
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/explorer/${configId}.json`,
      );

    if (isArray(cohortBuilderConfiguration)) {
      // older config layout
      // TODO: remove this
      return {
        props: {
          ...(await getNavPageLayoutPropsFromConfig()),
          explorerConfig: cohortBuilderConfiguration,
          headerMetadata: cohortBuilderConfiguration?.headerMetadata
            ? cohortBuilderConfiguration.headerMetadata
            : DefaultHeaderMetadata,
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
        // headerMetadata: { ...(cohortBuilderConfiguration?.headerMetadata ? cohortBuilderConfiguration.headerMetadata : {}) },
        accessControl: {
          ...DefaultAccessControlConfiguration,
          ...cohortBuilderConfiguration.accessControl,
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
        explorerConfig: undefined,
      },
    };
  }
};
