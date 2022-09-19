import FooterHEAL, { FooterProps } from '../components/Navigation/Footer';
import { GetStaticProps } from 'next';
import Header, { HeaderProps } from '../components/Navigation/Header';

import Discovery from '../components/Discovery/Discovery';
import { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';

const DiscoveryPage =({ top, navigation }: HeaderProps) => {

  return (
    <div className='flex flex-col'>
      <Header top={top} navigation={navigation} />
      <div className='flex flex-row justify-items-center'>
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          Coming Soon
        </div>
      </div>
    </div>
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

export default Discovery;
