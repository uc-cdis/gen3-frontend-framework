import type { GetServerSideProps } from 'next';
import type { NavPageLayoutProps } from '../../../features/Navigation';
import ContentSource from '../../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import type { VLMDSubmissionConfig } from '../../../features/DiscoveryForms/VLMDSubmission/types';

export const VLMDSubmissionPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const config: VLMDSubmissionConfig =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/vlmdSubmission.json`,
      );
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: {
          remoteSupportService: {
            service: 'zenDesk',
            configuration: { zendeskSubdomainName: 'gen3support' },
          },
        },
      },
    };
  }
};
