import React from 'react';
import dynamic from 'next/dynamic';

import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
//import JBrowseView from '../components/JBrowser';
// import IGVViewer from '@/components/IGVViewer';

// const DynamicIGVViewer = dynamic(() => import('@/components/IGVViewer'), {
//   ssr: false,
// });

import JBrowseView from '../components/JBrowse/JBrowseView';

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Sample Page',
        content: 'Sample Data',
        key: 'gen3-sample-page',
      }}
    >
      <div className="w-full m-10">
        <JBrowseView />
      </div>
    </NavPageLayout>
  );
};

// TODO: replace this with a custom getServerSideProps function
export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
