import {GetStaticProps} from 'next';
import ContentSource from '../../lib/content';

import NavPageLayout, { NavPageLayoutProps } from '../../components/Navigation/NavPageLayout';
import ResearchPageContent, {ResearchPageConfig} from '../../components/Contents/ResearchPageContent';
import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';

interface ResearchPageProps extends NavPageLayoutProps {
    researchPageConfig: ResearchPageConfig
}

const ResearchPage = ({headerProps, footerProps, researchPageConfig}: ResearchPageProps) => {

  return (
    <NavPageLayout {...{headerProps, footerProps}}>
      <div className='flex flex-row  justify-items-center'>
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          <ResearchPageContent {...researchPageConfig}/>
        </div>
      </div>
    </NavPageLayout>
  );
};


// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<ResearchPageProps> = async ( ) => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  const researchPageConfig = await ContentSource.get('config/research.json') as unknown as ResearchPageConfig;
  return {
    props: {
      ...navPageLayoutProps,
      researchPageConfig
    }
  };
};

export default ResearchPage;
