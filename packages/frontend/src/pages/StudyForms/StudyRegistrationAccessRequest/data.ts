import { GetServerSideProps } from 'next';
import { NavPageLayoutProps } from '../../../features/Navigation';
import ContentSource from '../../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import { ConfigStudyRegistrationAccessRequestFormProps } from './types';

import { GEN3_COMMONS_NAME } from '@gen3/core';

export const RequestAccessFormPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const configStudyRegistrationAccessRequestForm: ConfigStudyRegistrationAccessRequestFormProps =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/studyRegistrationAccessRequestForm.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        ...{
          configStudyRegistrationRequestAccessForm:
            configStudyRegistrationAccessRequestForm,
        },
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
              text: '# Study Registration Access Request: Not Authorized \n You are not authorized to access this page. If you believe this is an error, contact your administrator or support.',
              className: 'text-center',
            },
          ],
        },
      },
    };
  }
};
