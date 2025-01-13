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
          src="https://localhost:3010/jupyter_0.4.3/repl/index.html?kernel=python&prerun=%25pip%20install%20igv_notebook&prerun-code=import%20igv_notebook%0Aigv_notebook.init%28%29%0Ab%20%3D%20igv_notebook.Browser%28%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%22genome%22%3A%20%22hg19%22%2C%0A%20%20%20%20%20%20%20%20%22locus%22%3A%20%22chr22%3A24%2C376%2C166-24%2C376%2C456%22%2C%0A%20%20%20%20%20%20%20%20%22tracks%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22name%22%3A%20%22BAM%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fs3.amazonaws.com%2Figv.org.demo%2Fgstt1_sample.bam%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22indexURL%22%3A%20%22https%3A%2F%2Fs3.amazonaws.com%2Figv.org.demo%2Fgstt1_sample.bam.bai%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22format%22%3A%20%22bam%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22alignment%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%7D%29%0Ab.zoom_in%28%29"
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
