// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
import type { GetServerSideProps } from 'next';
import type { LandingPageProps } from '../../components/Content/LandingPageContent';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const LandingPageGetServerSideProps: GetServerSideProps = async () => {
  const landingPage: LandingPageProps =
    await ContentSource.getContentDatabase().get(
      `${GEN3_COMMONS_NAME}/landingPage.json`,
    );

  // "/" would redirect back to this page in a loop
  if (landingPage?.redirectPage && landingPage.redirectPage !== '/') {
    return {
      redirect: {
        destination: landingPage.redirectPage,
        permanent: false,
      },
    };
  }

  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  return {
    props: {
      ...navPageLayoutProps,
      landingPage,
    },
  };
};
