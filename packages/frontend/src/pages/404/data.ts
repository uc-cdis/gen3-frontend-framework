import { GetServerSideProps } from 'next';
import { NavPageLayoutProps } from '../../features/Navigation';
import ContentSource from '../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { Config404Props } from './types';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const Custom404PageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  
  try {
    const config404: Config404Props = await ContentSource.getContentDatabase().get(
      `${GEN3_COMMONS_NAME}/404.json`,
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        ...{ config404: config404 },
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config404: {
          "content": [
            {
              "type": "markdown",
              "text": "# 404: Page Not Found \n Sorry, we couldn&apos;t find the page you were looking for.",
              "className": "text-center"
            }
          ]
        },
      },
    };
  }
};
