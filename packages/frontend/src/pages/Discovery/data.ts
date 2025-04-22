import { GetServerSideProps } from 'next';
import { DataLibraryStoreMode, GEN3_COMMONS_NAME } from '@gen3/core';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type DiscoveryConfig } from '../../features/Discovery';
import type { NavPageLayoutProps } from '../../features/Navigation';
import { DataLibraryConfig } from '../../features/DataLibrary';

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

    console.log('Discovery ', discoveryConfig);
    discoveryConfig.metadataConfig?.forEach((index) => {
      if (index.features.exportFromDiscovery)
        index.features.exportFromDiscovery.dataLibraryStoreMode =
          datalibraryConfig?.storageMode ?? DataLibraryStoreMode.ApiOnly;
    });

    console.log('Updated Config', discoveryConfig);

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
        discoveryConfig: undefined,
      },
    };
  }
};
