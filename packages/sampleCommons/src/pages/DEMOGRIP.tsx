import React, {useState, useEffect, useMemo, useRef} from 'react';
import { Paper, Button, Modal } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';

import {gripApiFetch, gripApiResponse} from '@gen3/core';
import { GetServerSideProps } from 'next';
import * as echarts from 'echarts';

interface ChartData {
  data: {
    observation: {
      category: string;
    }[];
  };
}

interface ModalType {
  code?: string;
  text?: string;
}
const DonutChart = ({ data }: { data: ChartData }) => {
  // Harcoded example
  const observations = data.data.observation.map(item => item.category);
  const aggregatedData: Record<string, number> = observations.reduce((counts, category) => {
    counts[category] = (counts[category] || 0) + 1;
      return counts;
  }, {} as Record<string, number>);

  const transformedData = Object.entries(aggregatedData).map(([category, count]) => ({name: category, value: count}));
  console.log('TRANSFORM DATA: ', transformedData);

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
  }, [transformedData]);

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

function MyModal({text}: {text?: ModalType}) {
  const [isOpen, setIsOpen] = useState(true);
  const closeModal = () => setIsOpen(false);
  return (
    <React.Fragment>
      <Modal
        opened={isOpen}
        onClose={closeModal}
        title={text ? <p>{text.code ?? ''}, {text.text ?? ''}</p> : null}      >
        <Button onClick={closeModal}>Close</Button>
      </Modal>
    </React.Fragment>
  );
}
const SamplePage = ( {headerProps, footerProps}: NavPageLayoutProps) => {
  const [items, setItems] = useState<gripApiResponse<unknown> | undefined>(undefined);
  const [isLoading, setLoading]=useState(true);
  const [isError, setError]=useState<gripApiResponse<unknown> | undefined>(undefined);

  const query =
  `query($filter: JSON){
    observation(filter: $filter first: 10000){
      category
    }
   }`;
  useEffect(() => {
    const variables ={filter:{AND:[{IN:{project_id:['synthea-test']}}]}};
    const fetchData = async () => {
      try {
        const result = await gripApiFetch('graphql/synthea', {
          query: query,
          variables: variables
        });
          setItems(result);
          setLoading(false);
      } catch (error) {
        setLoading(false);
        //setError(error);
      }
    };
    fetchData();
  }, [query]);

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
       <Paper>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          {isLoading ? (
            <p>Loading data...</p>
            ) : (
                <div>
                  {items ? <DonutChart data={items as ChartData} /> : null}
                </div>
              )
            }
          </div>
      </Paper>
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
