import React from 'react';
import { Text, Paper, Grid, Mark } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,

} from '@gen3/frontend';

import {guppyAPIFetch} from '@gen3/core';
import { GetServerSideProps } from 'next';
import {useState, useEffect} from 'react';

const DataComponent = ({ data }) => {
  return (
    <Grid>
      {data.map((item) => (
        <Grid.Col key={item.id} span={4} style={{ marginBottom: 5, marginTop: 5 }}>
          <Paper padding="lg" shadow="xs">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ margin: 10}} >  ✅  </Text>
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

const variables ={filter:{AND:[{IN:{project_id:['synthea-test']}}]}};
const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const [items, setItems] = useState();
  const [isLoading, setLoading]=useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await guppyAPIFetch({
          query: query,
          variables: variables
        });
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
          <div>Loading...</div>
        ) : (
          <DataComponent data={items} />
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
