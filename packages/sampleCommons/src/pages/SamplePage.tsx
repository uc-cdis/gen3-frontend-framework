import React from 'react';
import { Center, Text, Paper } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,

} from '@gen3/frontend';

import {guppyAPIFetch} from '@gen3/core';
import { GetServerSideProps } from 'next';
import {useState, useEffect} from 'react';



interface FileQueryResult {
  file: Item[];
}

interface GuppyAPIFetchResult {
  data: FileQueryResult;
}

interface SamplePageProps {
  headerProps: any; // Adjust the type according to your actual props
  footerProps: any; // Adjust the type according to your actual props
}

interface Item {
  id: string;
  subject: string;
}

interface DataComponentProps {
  data: Item[];
}
const DataComponent = ({ data }: DataComponentProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <div className="w-full m-10">
        <Center>
        <Paper shadow="md" p="xl" withBorder>
          <Text>This is a example custom page in Gen3</Text>
          <Text>
            You can add your own content here, and add a link to this page in
            the navigation bar by editing the config file in
            navigation.json
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
