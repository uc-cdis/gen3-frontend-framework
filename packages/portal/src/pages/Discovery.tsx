import { GetStaticProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import ProtectedContent from '../components/Login/ProtectedContent';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';

const DiscoveryPage =({ headerProps, footerProps }: NavPageLayoutProps) => {

  console.log("headerProps", headerProps);
  return (
    <NavPageLayout  {...{ headerProps, footerProps }} >
      <div className='flex flex-row justify-items-center'>
        <ProtectedContent />
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          Coming Soon
        </div>
      </div>
    </NavPageLayout>
  );
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async ( ) => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig())
    }
  };
};

export default DiscoveryPage;
