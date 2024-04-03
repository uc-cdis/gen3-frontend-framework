import {GetStaticProps} from 'next';
import ContentSource from '../../lib/content';

import NavPageLayout, { NavPageLayoutProps } from '../../components/Navigation/NavPageLayout';
import CardedPageContent, {CardedPageConfig} from '../../components/Contents/CardedPageContent';
import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';

interface ResourcePageProps extends NavPageLayoutProps {
    newDatasetsPageConfig: CardedPageConfig
}

const ResourcePage = ({headerProps, footerProps, newDatasetsPageConfig}: ResourcePageProps) => {

  return (
    <NavPageLayout {...{headerProps, footerProps}}>
      <div className='flex flex-row  justify-items-center'>
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          <CardedPageContent {...newDatasetsPageConfig}/>
        </div>
      </div>
    </NavPageLayout>
  );
};


// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<ResourcePageProps> = async ( ) => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  const newDatasetsPageConfig = await ContentSource.get('config/newDatasets.json') as unknown as CardedPageConfig;
  return {
    props: {
      ...navPageLayoutProps,
      newDatasetsPageConfig
    }
  };
};

export default ResourcePage;
