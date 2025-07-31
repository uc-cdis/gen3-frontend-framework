import React from 'react';
import { Center, Paper, Text } from '@mantine/core';
import {
  getNavPageLayoutPropsFromConfig,
  NavPageLayout,
  NavPageLayoutProps,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';

const CustomHeader = () => {
  return (
    <div className="bg-secondary flex justify-items-center w-full h-12">
      <Text>Custom Header</Text>
    </div>
  );
};

const CustomFooter = () => {
  return (
    <div className="bg-primary flex justify-items-center w-full h-12">
      <Text>Custom Footer</Text>
    </div>
  );
};

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Sample Page',
        content: 'Sample Data',
        key: 'gen3-sample-page',
      }}
      CustomHeaderComponent={CustomHeader}
      CustomFooterComponent={CustomFooter}
    >
      <div className="w-full m-10">
        <Center>
          <Paper shadow="md" p="xl" withBorder>
            <Text>This is a example custom page in Gen3</Text>
            <Text>
              You can add your own content here, and add a link to this page in
              the navigation bar by editing the config file in navigation.json
              You can also add a custom header and footer by using the
              CustomHeaderComponent and CustomFooterComponent props in the
              NavPageLayout component.
            </Text>
          </Paper>
        </Center>
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
