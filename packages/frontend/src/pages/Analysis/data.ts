import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { AnalysisPageLayoutProps } from './types';
import { AnalysisCenterConfiguration } from '../../features/Analysis/types';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const AnalysisPageGetServerSideProps: GetServerSideProps<
  AnalysisPageLayoutProps
> = async () => {
  try {
    const analysisConfig: AnalysisCenterConfiguration = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/analysisCenter.json`,
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        ...analysisConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        analysis: [],
      },
    };
  }
};
