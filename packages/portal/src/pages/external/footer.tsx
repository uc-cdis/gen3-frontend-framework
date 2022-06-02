import { GetStaticProps } from 'next';
import Head from 'next/head';

import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';
import Footer, { FooterProps } from '../../components/Navigation/Footer';

const StandaloneFooterPage = (props: FooterProps) => {
  return <>
    <Head>
      {/* footer links should open in parent (probably data portal) frame */}
      <base target='_parent'/>
    </Head>
    <Footer {...props}/>
  </>;
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
