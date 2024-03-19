import React, {useState, useEffect, useMemo, useRef} from 'react';
import { Paper, Button, Text, Modal } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';

import {gripApiFetch, JSONObject} from '@gen3/core';
import { GetServerSideProps } from 'next';
import * as echarts from 'echarts';
import type {ECharts} from 'echarts'

const DonutChart = ({ data }) => {
  // Harcoded example
  const observations = data.data.observation.map(item => item.category);
  const aggregatedData = observations.reduce((counts, category) => {
      counts[category] = (counts[category] || 0) + 1;
      return counts;
  }, {});

  const transformedData = Object.entries(aggregatedData).map(([category, count]) => ({name: category, value: count}));
  console.log("TRANSFORM DATA: ", transformedData)

  const chartRef = useRef(null);
  const chartDefinition = useMemo(() => {
      return {
          legend: {
              orient: 'horizontal',
              top: '5%',
              right: '5%',
          },
          tooltip: {
              show: false,
              trigger: 'item',
          },
          label: {
              show: false,
              position: 'center',
          },
          series: [
              {
                  type: 'pie',
                  radius: ['30%', '50%'],
                  data: transformedData,
                  label: {
                    show: false
                  },
                  labelLine: {
                      show: false,
                  },
              },
          ],
      };
  }, [data]);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    chart?.setOption(chartDefinition);
    return () => {
      chart?.dispose();
    };
  }, [chartDefinition]);

  return (
    <div className="w-80 h-80" ref={chartRef}></div>
  );
};

function MyModal({text}) {
  const [isOpen, setIsOpen] = useState(true);
  const closeModal = () => setIsOpen(false);
  return (
    <>
      <Modal
      opened={isOpen}
      onClose={closeModal}
      title={<p>{text.code}, {text.text}</p>}
      >

        <Button onClick={closeModal}>Close</Button>
      </Modal>
    </>
  );
}

const SamplePage = ( {headerProps, footerProps}: NavPageLayoutProps) => {
  const [items, setItems] = useState();
  const [isLoading, setLoading]=useState(true);
  const [isError, setError]=useState();

  const variables ={filter:{AND:[{IN:{project_id:['synthea-test']}}]}};
  const query =
  `query($filter: JSON){
    observation(filter: $filter first: 10000){
      category
    }
   }`;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await gripApiFetch({
          query: query,
          variables: variables
        });
          setItems(result);
          setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error);
      }
    };
    fetchData();
  }, []);

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
       <Paper>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          {isLoading ? (
            <p>Loading data...</p>
            ) : (
              isError ? (
                <div>
                  <MyModal text={isError}/>
                </div>
              ) : (
                <div>
                  <DonutChart data={items} />
                </div>
              )
            )}
          </div>
      </Paper>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
