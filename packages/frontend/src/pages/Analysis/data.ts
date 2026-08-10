import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { AnalysisPageLayoutProps } from './types';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const AnalysisPageGetServerSideProps: GetServerSideProps<
  AnalysisPageLayoutProps
> = async () => {
  try {
    const analysisConfig: AnalysisPageLayoutProps =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/analysisTools.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        ...analysisConfig,
      },
    };
  } catch (err) {
    console.warn(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  }
};
