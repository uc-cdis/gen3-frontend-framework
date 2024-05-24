import React from 'react';
import { GetServerSideProps } from 'next';
import { MantineProvider, Container, Text, Image } from '@mantine/core';
import ReactECharts from 'echarts-for-react';

import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';

interface SamplePageProps {
  headerProps: any;
  footerProps: any;
}

const HorizontalBarChart = () => {
  // Sample data with 20 organs
  const data = [
    { name: 'Brain', value: 300 },
    { name: 'Lung', value: 600 },
    { name: 'Breast', value: 900 },
    { name: 'Colon', value: 1200 },
    { name: 'Liver', value: 1500 },
    { name: 'Stomach', value: 1800 },
    { name: 'Pancreas', value: 2100 },
    { name: 'Ovary', value: 2400 },
    { name: 'Prostate', value: 2700 },
    { name: 'Kidney', value: 3000 },
    { name: 'Bladder', value: 3300 },
    { name: 'Thyroid', value: 3600 },
    { name: 'Melanoma', value: 3900 },
    { name: 'Leukemia', value: 4200 },
    { name: 'Lymphoma', value: 4500 },
    { name: 'Esophagus', value: 4800 },
    { name: 'Bone', value: 5100 },
    { name: 'Skin', value: 5400 },
    { name: 'Soft Tissue', value: 5700 },
    { name: 'Testis', value: 6000 },
  ];

  // Extracting names and values from data
  const organs = data.map((item) => item.name);

  // ECharts options
  const option = {
    yAxis: {
      type: 'category',
      data: organs,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: function (value: number, index: number): string {
          return data[index]['value'].toString();
        },
      },
    },
    grid: {
      height: 500,
    },
    series: [
      {
        data: data.map((item) => item.value),
        type: 'bar',
        barCategoryGap: '50%',
      },
    ],
  };

  return (
    <div className="w-128 h-512">
      <ReactECharts option={option} />
    </div>
  );
};

const SMCLICK = ({ headerProps, footerProps }: SamplePageProps) => {
  return (
    <NavPageLayout headerProps={headerProps} footerProps={footerProps}>
      <MantineProvider withGlobalStyles>
        <div className="w-full pt-5">
          <div className="bg-cbds-primary pt-[1.5%] pb-[1.5%]">
            <Container className="bg-cbds-monoprimary text-center">
              <span className="flex items-center space-x-4">
                <div className="p-5 w-1/6 flex-shrink-0">
                  <Image src={'/icons/SMMART.svg'} alt={'logo'} />
                </div>
                <Text className="whitespace-nowrap text-center text-white text-5xl font-bold">
                  SMMART Clinical Trials Platform
                </Text>
              </span>
            </Container>
          </div>

          <div className="basis-1/3 p-10">
            <h1 className="prose sm:prose-base 2xl:prose-lg mb-5 !mt-0">
              Overview of SMMART and datasets, what can be found in this project
            </h1>
            <button className="bg-cbds-monoprimary text-white py-2 px-4 rounded">
              Explore Datasets
            </button>
          </div>
          <HorizontalBarChart />
          <HorizontalBarChart />

          <div className="bg-gray-200 py-5">
            <Container className="text-center mx-auto">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">A</div>
                  <div className="text-sm">Donors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">S</div>
                  <div className="text-sm">Samples</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">D</div>
                  <div className="text-sm">Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">F</div>
                  <div className="text-sm">Organs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">G</div>
                  <div className="text-sm">Collections</div>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </MantineProvider>
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

export default SMCLICK;
