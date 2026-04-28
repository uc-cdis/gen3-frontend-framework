import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { SubmissionConfig } from '../../features/Submission/types';
import { DictionaryConfig } from '../../features/Dictionary';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { SubmissionsPageLayoutProps } from './types';

export const SubmissionPageGetServerSideProps: GetServerSideProps<
  SubmissionsPageLayoutProps
> = async () => {
  try {
    const submissionConfig: SubmissionConfig =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/submission.json`,
      );

    const dictionaryConfig: DictionaryConfig =
        await ContentSource.getContentDatabase().get(
          `${GEN3_COMMONS_NAME}/dictionary.json`,
        );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        submissionConfig: submissionConfig,
        dictionaryConfig: dictionaryConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        submissionConfig: undefined,
        dictionaryConfig: undefined,
      },
    };
  }
};
