// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
import { GetStaticProps } from "next";
import { getNavPageLayoutPropsFromConfig } from "../../lib/common/staticProps";
import ContentSource from "../../lib/content";

export const LandingPageGetStaticProps: GetStaticProps = async () => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  const config = await ContentSource.get("config/siteConfig.json");
  const landingPage = await ContentSource.get(
    `config/${config.commons}/landingPage.json`
  );
  return {
    props: {
      ...navPageLayoutProps,
      landingPage
    }
  };
};
