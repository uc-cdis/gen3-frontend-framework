import { GetStaticProps } from 'next';
import { NavPageLayout, NavPageLayoutProps } from '../components/Navigation';
import { getNavPageLayoutPropsFromConfig } from '../lib/common/staticProps';
import ContentSource from '../lib/content';
import LoginPanel, { LoginPanelProps } from '../components/Login/LoginPanel';

type LoginPageProps = NavPageLayoutProps & LoginPanelProps;

const LoginPage = ({
  headerProps,
  footerProps,
  topContent,
  bottomContent,
}: LoginPageProps) => {
  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <LoginPanel topContent={topContent} bottomContent={bottomContent} />
      </NavPageLayout>
    </div>
  );
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async () => {
  const config = await ContentSource.get('config/siteConfig.json');

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...(await ContentSource.get(`config/${config.commons}/login.json`)),
    },
  };
};

export default LoginPage;
