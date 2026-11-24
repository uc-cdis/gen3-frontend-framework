import type { GetServerSideProps } from 'next';
import { merge } from 'lodash';
import { DataLibraryStoreMode, GEN3_COMMONS_NAME } from '@gen3/core';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type DiscoveryConfig } from '../../features/Discovery';
import type { NavPageLayoutProps } from '../../features/Navigation';
import type { DataLibraryConfig } from '../../features/DataLibrary';
import { DiscoveryIndexConfig } from '../../features/Discovery/types';

const DEFAULT_DISCOVERY_CONFIG: DiscoveryIndexConfig = {
  authz: [],
  features: {
    authorization: {},
    pageTitle: {
      enabled: false,
      text: '',
    },
  },
  aggregations: [],
  tags: {
    tagCategories: [],
  },
  tableConfig: {},
  studyColumns: [],
  minimalFieldMapping: {
    authzField: 'authz',
    tagsListField: 'tags',
    uid: 'guid',
  },
};

export const DiscoveryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const discoveryConfig: DiscoveryConfig =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/discovery.json`,
      );
    // need data library config for export from discovery using the DataLibrary
    const datalibraryConfig: DataLibraryConfig =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/dataLibrary.json`,
      );

    const storeMode =
      datalibraryConfig?.storageMode ?? DataLibraryStoreMode.ApiOnly;

    // merge the defaults into each index's config (config values win) without mutating the defaults
    discoveryConfig.metadataConfig = (discoveryConfig.metadataConfig ?? []).map(
      (indexConfig) => {
        const merged = merge({}, DEFAULT_DISCOVERY_CONFIG, indexConfig);
        if (merged.features.exportFromDiscovery)
          merged.features.exportFromDiscovery.dataLibraryStoreMode = storeMode;
        return merged;
      },
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        discoveryConfig: discoveryConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        discoveryConfig: [],
      },
    };
  }
};
