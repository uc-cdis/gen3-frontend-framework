import { GetServerSideProps } from 'next';
import { NavPageLayoutProps } from '../../../features/Navigation';
import ContentSource from '../../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import { ConfigStudyRegistrationAccessRequestFormProps } from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest/types';

import { GEN3_COMMONS_NAME } from '@gen3/core';

export const VLMDSubmissionAccessRequestPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const configVLMDSubmissionAccessRequestForm: ConfigStudyRegistrationAccessRequestFormProps =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/vlmdSubmissionAccessRequestForm.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configStudyRegistrationRequestAccessForm:
          configVLMDSubmissionAccessRequestForm,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configStudyRegistrationRequestAccessForm: {
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
