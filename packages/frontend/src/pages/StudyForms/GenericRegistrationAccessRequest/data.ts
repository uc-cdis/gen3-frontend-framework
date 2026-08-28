import ContentSource from '../../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';
import type { GetServerSideProps } from 'next';
import type { NavPageLayoutProps } from '../../../features/Navigation';
import type { ConfigGenericRegistrationAccessRequestFormProps } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/types';

import { GEN3_COMMONS_NAME } from '@gen3/core';

export const RequestAccessFormPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    const configGenericRegistrationAccessRequestForm: ConfigGenericRegistrationAccessRequestFormProps =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/studyRegistrationAccessRequestForm.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),

        configStudyRegistrationRequestAccessForm:
          configGenericRegistrationAccessRequestForm,
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
