import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import {
  type CrosswalkConfig,
  type CrosswalkName,
} from '../../features/Crosswalk';
import { type NavPageLayoutProps } from '../../features/Navigation';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { CrosswalkMapping } from '../../features/Crosswalk/types';

interface InitialCrosswalkInfo extends CrosswalkName {
  dataPath: string;
}

export interface InitialCrosswalkConfig {
  mapping: {
    source: CrosswalkName;
    external: Array<InitialCrosswalkInfo>;
  };
}

export const CrosswalkPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  const initialConfig: InitialCrosswalkConfig = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/crosswalk.json`,
  );
  const regex = /->/g;
  const processedConfig = {
    mapping: {
      source: initialConfig.mapping.source,
      external: initialConfig.mapping.external.map((entry) => ({
        ...entry,
        dataPath: entry.dataPath
          .split(regex)
          .map((x) => JSON.stringify([x]))
          .join('.'), // To Support JSONPath when a key is a URL
      })),
    },
  };

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      config: processedConfig,
    },
  };
};
