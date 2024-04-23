import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { SubmissionConfig } from '../../features/Submission/types';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { SubmissionsPageLayoutProps } from './types';

export const SubmissionPageGetServerSideProps: GetServerSideProps<
  SubmissionsPageLayoutProps
> = async () => {
  try {
    const submissionConfig: SubmissionConfig = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/submission.json`,
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        submissionConfig: submissionConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        submissionConfig: undefined,
      },
    };
  }
};
