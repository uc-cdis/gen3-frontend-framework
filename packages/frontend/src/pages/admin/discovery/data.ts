import type { GetServerSideProps } from 'next';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import ContentSource from '../../../lib/content';
import type { DiscoveryConfig } from '../../../features/Discovery';
import type { DiscoveryConfigPageProps } from './DiscoveryConfigPage';

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
