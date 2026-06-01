import { GetServerSideProps } from 'next';
import { NavPageLayoutProps } from '../../features/Navigation';
import ContentSource from '../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { Config403Props } from './types';
import { WorkspaceConfig } from '../../features/Workspace';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const Custom403PageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  
  try {
    const config403: Config403Props = 
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/403.json`,
      );
    const workspaceProps: WorkspaceConfig =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/workspace.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        ...{ config403: config403, form403: workspaceProps?.requestAccessForm },
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config403: {
          "content": [
            {
              "type": "markdown",
              "text": "# 403: Not Authorized \n You are not authorized to access this page. If you believe this is an error, contact your administrator or support.",
              "className": "text-center"
            }
          ]
        },
      },
    };
  }
};
