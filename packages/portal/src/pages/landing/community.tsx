import {GetStaticProps} from 'next';
import ContentSource from '../../lib/content/';

import NavPageLayout, { NavPageLayoutProps } from '../../components/Navigation/NavPageLayout';
import CommunityPageContent, {CommunityPageConfig} from '../../components/Contents/CommunityPageContent';
import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';

interface CommunityPageProps extends NavPageLayoutProps {
    communityPageConfig: CommunityPageConfig
}

const CommunityPage = ({headerProps, footerProps, communityPageConfig}: CommunityPageProps) => {

  return (
    <NavPageLayout {...{headerProps, footerProps}}>
      <div className='flex flex-row  justify-items-center'>
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          <CommunityPageContent {...communityPageConfig}/>
        </div>
      </div>
    </NavPageLayout>
  );
};


// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<CommunityPageProps> = async ( ) => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  const communityPageConfig = await ContentSource.get('config/community.json') as unknown as CommunityPageConfig;
  return {
    props: {
      ...navPageLayoutProps,
      communityPageConfig
    }
  };
};

export default CommunityPage;
