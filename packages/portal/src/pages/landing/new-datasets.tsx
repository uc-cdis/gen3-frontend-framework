import {GetStaticProps} from 'next';
import ContentSource from '../../lib/content';

import NavPageLayout, { NavPageLayoutProps } from '../../components/Navigation/NavPageLayout';
import NewDatasetsPageContent, {NewDatasetsPageConfig} from '../../components/Contents/NewDatasetsPageContent';
import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';

interface NewDatasetsPageProps extends NavPageLayoutProps {
    newDatasetsPageConfig: NewDatasetsPageConfig
}

const ResourcePage = ({headerProps, footerProps, newDatasetsPageConfig}: NewDatasetsPageProps) => {

  return (
    <NavPageLayout {...{headerProps, footerProps}}>
      <div className='flex flex-row  justify-items-center'>
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          <NewDatasetsPageContent {...newDatasetsPageConfig}/>
        </div>
      </div>
    </NavPageLayout>
  );
};


// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<NewDatasetsPageProps> = async ( ) => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  const newDatasetsPageConfig = await ContentSource.get('config/newDatasets.json') as unknown as NewDatasetsPageConfig;
  return {
    props: {
      ...navPageLayoutProps,
      newDatasetsPageConfig
    }
  };
};

export default ResourcePage;
