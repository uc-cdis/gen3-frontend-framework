import {GetStaticProps} from 'next';
import ContentSource from '../../lib/content';

import NavPageLayout, { NavPageLayoutProps } from '../../components/Navigation/NavPageLayout';
import ResourcePageContent, {ResourcePageConfig} from '../../components/Content/ResourcePageContent';
import { getNavPageLayoutPropsFromConfig } from '@/lib/common/staticProps';

interface ResourcePageProps extends NavPageLayoutProps {
    resourcePageConfig: ResourcePageConfig
}

const ResourcePage = ({headerProps, footerProps, resourcePageConfig}: ResourcePageProps) => {

  return (
    <NavPageLayout {...{headerProps, footerProps}}>
      <div className='flex flex-row  justify-items-center'>
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          <ResourcePageContent {...resourcePageConfig}/>
        </div>
      </div>
    </NavPageLayout>
  );
};


// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<ResourcePageProps> = async ( ) => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  const config = await ContentSource.get("config/siteConfig.json");
  const resourcePageConfig = await ContentSource.get(`config/${config.commons}/resource.json`) as unknown as ResourcePageConfig;
  return {
    props: {
      ...navPageLayoutProps,
      resourcePageConfig
    }
  };
};

export default ResourcePage;
