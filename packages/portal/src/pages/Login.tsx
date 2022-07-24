import { GetStaticProps } from 'next';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import siteConfig from '../../config/siteConfig.json';
import { useCSRFToken } from '@gen3/core';
import { LandingPageProps } from '../components/Contents/LandingPageContent';
import LoginProvidersPanel from '../components/Login/LoginProvidersPanel';

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const LoginPage = ({ headerProps, footerProps }: Props) => {

  useCSRFToken(siteConfig.hostname);
  const handleLoginSelected = (url: string) => {
    console.log(url);
  };

  return (
    <div className='flex flex-col'>
      <NavPageLayout {...{ headerProps, footerProps }}>
        <div className='flex flex-row justify-items-center'>
          <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
            <LoginProvidersPanel referenceURL='/' handleLoginSelected={handleLoginSelected} />
          </div>
        </div>
      </NavPageLayout>
    </div>
  );
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};


export default LoginPage;
