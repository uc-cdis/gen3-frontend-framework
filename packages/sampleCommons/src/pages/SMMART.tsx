import React from 'react';
import { GetServerSideProps } from 'next';
import { MantineProvider, Container, Text, Button, Grid, Card, Image, Flex } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';


interface SamplePageProps {
    headerProps: any;
    footerProps: any;
}


const SMMART = ({ headerProps, footerProps }: SamplePageProps) => {
    return (
      <NavPageLayout headerProps={headerProps} footerProps={footerProps}>
        <MantineProvider withGlobalStyles withNormalizeCSS>
          <div className="w-full pt-20">
            <div style={{ backgroundColor: '#5c67a3', padding: '2.5% 0', borderBottom: '0.5% solid #7684c7'}}>
              <Container style={{ backgroundColor: '#7684c7', padding: '1%', textAlign: 'center' }}>
                <Text className="text-white text-3xl font-bold">
                  Welcome to the Center for Biomedical Data Science Integrated Data Portal
                </Text>
                <Text className="text-white text-xl pt-10">
                  Explore projects supported by the CBDS-IDP. Discover and download datasets.
                </Text>
              </Container>
            </div>
            <Container fluid style={{ marginTop: '2%' }}>
              <Flex justify="space-around" wrap="wrap" gap="2%">
                <Card shadow="sm" padding="lg" style={{ textAlign: 'center', flex: '1 1 20%', maxWidth: '300px', margin: '1%' }}>
                  <div className="flex items-center space-x-4 p-3">
                      <div className="w-1/5">
                      <Image className="w-1/2" src="/icons/SMMART.svg" alt="SMMART logo"/>
                      </div>
                    <Text className= "text-2xl text-center font-bold">SMMART</Text>
                  </div>
                  <Text className="p-5 text-left">Tumor Evolution and Resistance in Response to Therapy to identify methods and tests that can help us deliver better cancer treatment</Text>
                  <Button variant="outline">Explore</Button>
                </Card>

                <Card shadow="sm" padding="lg" style={{ textAlign: 'center', flex: '1 1 20%', maxWidth: '300px', margin: '1%' }}>
                  <Image src="path_to_aced_image" alt="ACED logo" />
                  <Text>ACED</Text>
                  <Text>ACED description</Text>
                  <Button variant="outline">Explore</Button>
                </Card>

                <Card shadow="sm" padding="lg" style={{ textAlign: 'center', flex: '1 1 20%', maxWidth: '300px', margin: '1%' }}>
                  <Image src="path_to_other_projects_image" alt="Other Projects logo" />
                  <Text>Other Projects</Text>
                  <Text>Other Projects description</Text>
                  <Button variant="outline">Explore</Button>
                </Card>
              </Flex>
            </Container>
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

export default SMMART;