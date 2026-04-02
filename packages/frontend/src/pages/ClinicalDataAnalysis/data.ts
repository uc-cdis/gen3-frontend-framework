import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type ClinicalDataConfiguration } from '../../features/ClinicalDataAnalysis/types';
import { type NavPageLayoutProps } from '../../features/Navigation';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { ClinicalDataAnalysisPageProps } from './types';

const NullConfiguration: ClinicalDataConfiguration = {
  tabs: [],
  index: '',
  initialFields: [],
  uniqueIdField: '',
  dataTypename: '',
};

export const ClinicalDataAnalysisServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (): Promise<
  GetServerSidePropsResult<ClinicalDataAnalysisPageProps>
> => {
  try {
    const configuration =
      await ContentSource.getContentDatabase().get<ClinicalDataConfiguration>(
        `${GEN3_COMMONS_NAME}/clinicalDataAnalysis.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: configuration,
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error in clinical data config';
    console.error(errorMessage);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: NullConfiguration,
      },
    };
  }
};
