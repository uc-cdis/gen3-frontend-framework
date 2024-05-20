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


const SmmartPage = ({ headerProps, footerProps }: SamplePageProps) => {
    return (
      <NavPageLayout headerProps={headerProps} footerProps={footerProps}>
        <MantineProvider withGlobalStyles>
          <div className="w-full pt-20">
            <div className="bg-cbds-primary pt-[1.5%] pb-[1.5%]">
              <Container className="bg-cbds-monoprimary text-center pt-[2.5%] pb-[2.5%]">
                <Text className="text-white text-3xl font-bold">
                  Welcome to the Center for Biomedical Data Science Integrated Data Portal
                </Text>
                <Text className="text-white text-xl pt-10">
                  Explore projects supported by the CBDS-IDP. Discover and download datasets.
                </Text>
              </Container>
            </div>
              <Grid gutter="lg" className="p-5 grid grid-cols-3">
                <Card className="shadow-lg p-6 text-center flex-1 basis-[20%] m-[13%]">
                  <div className="flex items-center space-x-4 p-3">
                      <div className="w-1/5">
                      <Image className="w-1/2" src="/icons/SMMART.svg" alt="SMMART logo"/>
                      </div>
                    <Text className= "text-2xl text-center font-bold">SMMART</Text>
                  </div>
                  <Text className="p-5 text-left">Tumor Evolution and Resistance in Response to Therapy to identify methods and tests that can help us deliver better cancer treatment</Text>
                  <div className="pb-5">
                  <Button className="py-3 w-1/2 h-1/6 !bg-cbds-secondary hover:!bg-cbds-monosecondary text-white text-lg border border-gray-300 border-2">Explore</Button>
                  </div>
                </Card>

                <Card className="shadow-lg p-6 text-center flex-1 basis-[20%] m-[13%]">
                  <Image src="path_to_aced_image" alt="ACED logo" />
                  <Text>GDC</Text>
                  <Text>A repository and computational platform for cancer researchers who need to understand cancer, its clinical progression, and response to therapy.</Text>
                  <Button className="w-1/2 h-1/6 !bg-cbds-secondary hover:!bg-cbds-monosecondary text-white border border-gray-300 border-2">Explore</Button>
                </Card>

                <Card className="shadow-lg p-6 text-center flex-1 basis-[20%] m-[13%]">
                  <Image src="path_to_other_projects_image" alt="Other Projects logo" />
                  <Text>Detroit-ROCS</Text>
                  <Text>A research study on the quality of life and other outcomes in African American cancer survivors who live in Metropolitan Detroit and were recently diagnosed with cancer.</Text>
                  <Button className="w-1/2 h-1/6 !bg-cbds-secondary hover:!bg-cbds-monosecondary text-white border border-gray-300 border-2">Explore</Button>
                </Card>
              </Grid>
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

export default SmmartPage;