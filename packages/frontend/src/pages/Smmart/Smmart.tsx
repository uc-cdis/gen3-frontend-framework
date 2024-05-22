import { GetServerSideProps } from 'next';
import { MantineProvider, Container, Text, Grid } from '@mantine/core';

import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import {
  getNavPageLayoutPropsFromConfig,
} from '../../lib/common/staticProps';

import ProjectCard from './ProjectCard';


interface SamplePageProps {
    headerProps: any;
    footerProps: any;
}

const projects = [
  {
    title: "SMMART",
    description: "A clinical research study measuring tumor evolution and its resistance to therapy to deliver better cancer treatment.",
    icon: "/icons/SMMART.svg",
    href: "/SMCLICK"
  },
  {
    title: "ACED",
    description: "A repository and computational platform for cancer researchers who need to understand cancer, its clinical progression, and response to therapy.",
    icon: "/icons/Soup.svg",
    href: "/"
  },
  {
    title: "Detroit-ROCS",
    description: "A research study on the quality of life and other outcomes in African American cancer survivors who live in Metropolitan Detroit and were recently diagnosed with cancer.",
    icon: "/icons/Soup.svg",
    href: "/"
  },
];

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
                {projects.map(project => (<ProjectCard {...project} />))}
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