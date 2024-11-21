import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';

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
        <iframe
          allow="cross-origin"
          src="https://localhost:3010/jupyter_0.4.3/index.html"
          width="100%"
          height="100%"
          title="client notebook"
        ></iframe>
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
