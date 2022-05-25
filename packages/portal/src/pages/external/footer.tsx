import { GetStaticProps } from 'next';

import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';
import Footer, { FooterProps } from '../../components/Navigation/Footer';

const StandaloneFooterPage = (props: FooterProps) => {
  return (
    <Footer {...props}/>
  );
};


export const getStaticProps: GetStaticProps = async () => {
  const {footerProps} = await getNavPageLayoutPropsFromConfig();
  return {
    props: {
      ...footerProps
    }
  };
};

export default StandaloneFooterPage;
