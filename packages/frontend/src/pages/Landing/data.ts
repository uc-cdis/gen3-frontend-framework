// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
import { GetStaticProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from "@gen3/core";

export const LandingPageGetStaticProps: GetStaticProps = async () => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  const landingPage = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/landingPage.json`
  );
  return {
    props: {
      ...navPageLayoutProps,
      landingPage
    }
  };
};
