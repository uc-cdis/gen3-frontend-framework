import { GetStaticProps } from 'next';

import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';
import ContentSource from '../../lib/content';
import Footer, { FooterProps } from '../../components/Navigation/Footer';

const StandaloneFooterPage = (props: FooterProps) => {
    console.log(props)
  return (
    <Footer {...props}/>
  );
};


export const getStaticProps: GetStaticProps = async () => {
  const {footerProps} = await getNavPageLayoutPropsFromConfig();
  const landingPage = await ContentSource.get('config/landingPage.json');
  return {
    props: {
      ...footerProps
    }
  };
};

export default StandaloneFooterPage;
