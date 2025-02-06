import { GetServerSideProps } from 'next';
import type { NavPageLayoutProps } from '../../features/Navigation';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { DataLibraryConfig } from '../../features/DataLibrary';

export const DataLibraryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const datalibraryConfig: DataLibraryConfig = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/dataLibrary.json`,
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: datalibraryConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: {
          useAPI: false,
          actions: [],
        },
      },
    };
  }
};
