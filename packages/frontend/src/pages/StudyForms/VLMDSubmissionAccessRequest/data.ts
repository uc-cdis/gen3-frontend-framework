import ContentSource from '../../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import type { GetServerSideProps } from 'next';
import type { NavPageLayoutProps } from '../../../features/Navigation';
import type { ConfigGenericRegistrationAccessRequestFormProps } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/types';

import { GEN3_COMMONS_NAME } from '@gen3/core';

export const VLMDSubmissionAccessRequestPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const configVLMDSubmissionAccessRequestForm: ConfigGenericRegistrationAccessRequestFormProps =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/vlmdSubmissionAccessRequestForm.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config:
          configVLMDSubmissionAccessRequestForm,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: {
          content: [
            {
              type: 'markdown',
              text: '# VLMD Submission Access Request: Not Authorized \n You are not authorized to access this page. If you believe this is an error, contact your administrator or support.',
              className: 'text-center',
            },
          ],
        },
      },
    };
  }
};
