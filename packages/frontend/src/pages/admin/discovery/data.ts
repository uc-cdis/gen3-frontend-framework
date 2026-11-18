import type { GetServerSideProps } from 'next';
import { DataLibraryStoreMode, GEN3_COMMONS_NAME } from '@gen3/core';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import ContentSource from '../../../lib/content';
import type { DiscoveryConfig } from '../../../features/Discovery';
import type { DiscoveryConfigPageProps } from './DiscoveryConfigPage';
import { DEFAULT_DISCOVERY_CONFIG } from '../../../pages/Discovery/data';
import type { DataLibraryConfig } from '../../../features/DataLibrary';
import { merge } from 'lodash';

/**
 * Loads the raw discovery.json for the current commons. Unlike the Discovery
 * page loader, nothing is merged in (e.g. dataLibraryStoreMode), so what the
 * editor exports matches the file on disk.
 */
export const DiscoveryConfigPageGetServerSideProps: GetServerSideProps<
  DiscoveryConfigPageProps
> = async () => {
  let discoveryConfig: DiscoveryConfig = { metadataConfig: [] };
  try {
    discoveryConfig = await ContentSource.getContentDatabase().get(
      `${GEN3_COMMONS_NAME}/discovery.json`,
    );

    // need data library config for export from discovery using the DataLibrary
    const datalibraryConfig: DataLibraryConfig =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/dataLibrary.json`,
      );

    const storeMode =
      datalibraryConfig?.storageMode ?? DataLibraryStoreMode.ApiOnly;

    // merge the defaults into each index's config
    discoveryConfig.metadataConfig = (discoveryConfig.metadataConfig ?? []).map(
      (indexConfig) => {
        const merged = merge({}, DEFAULT_DISCOVERY_CONFIG, indexConfig);
        if (merged.features.exportFromDiscovery)
          merged.features.exportFromDiscovery.dataLibraryStoreMode = storeMode;
        return merged;
      },
    );
  } catch (err) {
    console.error(err);
  }
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      discoveryConfig,
      commonsName: GEN3_COMMONS_NAME,
    },
  };
};
