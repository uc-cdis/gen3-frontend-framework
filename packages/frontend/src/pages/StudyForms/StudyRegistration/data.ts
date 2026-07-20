import { GetServerSideProps } from 'next';
import { NavPageLayoutProps } from '../../../features/Navigation';
import ContentSource from '../../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';

import { GEN3_COMMONS_NAME } from '@gen3/core';

export const RequestAccessFormPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    //TODO: TYPE THIS ANY
    const configStudyRegistrationForm: any =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/studyRegistrationForm.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        ...{
          configStudyRegistrationForm: configStudyRegistrationForm,
        },
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configStudyRegistrationForm: {
          content: [
            {
              type: 'markdown',
              text: '# Study Registration: Not Authorized \n You are not authorized to access this page. If you believe this is an error, contact your administrator or support.',
              className: 'text-center',
            },
          ],
        },
      },
    };
  }
};
