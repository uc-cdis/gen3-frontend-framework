import React from 'react';
import { Text, Paper, Grid, Title, Group } from '@mantine/core';
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
    <Grid>
      {data.map((item) => (
        <Grid.Col key={item.id} span={4} style={{ marginBottom: 5, marginTop: 5 }}>
          <Paper style={{ padding: 'lg', boxShadow: 'xs' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ margin: 10 }}>  ✅  </Text>
              <div>
                <div>Subject: {item.subject}</div>
              </div>
            </div>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
};

const query =
  `query($filter: JSON){
    file(filter: $filter first: 10000){
      subject
    }
   }`;

const variables = {
  filter: {
    AND: [{ IN: { project_id: ['synthea-test'] } }],
  },
};

const SamplePage = ({ headerProps, footerProps }: SamplePageProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const  headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result: GuppyAPIFetchResult = await guppyAPIFetch({
          query: query,
          variables: variables,
        }, headers);
        setItems(result.data.file);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <div className="w-full m-10">
        <Center>
        <Paper shadow="md" p="xl" withBorder>
          <Text>
            Demo report page under construction
          </Text>
        </Paper>
        </Center>
      </div>
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <Group style={{ margin: 20 }}>
        <Title> Synthetic Data FHIR references </Title>
        <DataComponent data={items} />
        </Group>
      )}
    </NavPageLayout>
  );
};


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
