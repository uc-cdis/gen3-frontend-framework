import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { NavPageLayoutProps } from '../../features/Navigation';
import { CohortBuilderConfiguration } from '../../features/CohortBuilder';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import {
  KEY_FOR_SEARCH_HISTORY,
  MAX_SEARCH_HISTORY,
} from '../../features/Dictionary/constants';

export const DictionaryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const cohortBuilderProps: CohortBuilderConfiguration =
      await ContentSource.get(`config/${GEN3_COMMONS_NAME}/dictionary.json`);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: cohortBuilderProps,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: {
          showGraph: false,
          showDownloads: false,
          historyStorageId: KEY_FOR_SEARCH_HISTORY,
          maxHistoryItems: MAX_SEARCH_HISTORY,
        },
      },
    };
  }
};
