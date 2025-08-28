import React from 'react';

// if we want to use MDX
// import LandingPageMDX from "../../content/landing.mdx"
import LandingPageContent, {
  LandingPageProps,
} from '../../components/Content/LandingPageContent';
import NavPageLayout from '../../features/Navigation/NavPageLayout';
import { NavPageLayoutProps } from '../../features/Navigation';

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const LandingPage = ({ headerProps, footerProps, landingPage }: Props) => {
  return (
    <NavPageLayout
      {...{ footerProps, headerProps }}
      headerMetadata={{
        title: 'Gen3 Home Page',
        content: 'Home page',
        key: 'gen3-home-page',
        ...(landingPage?.headerMetadata ? landingPage.headerMetadata : {}),
      }}
    >
      <div className="flex justify-items-center w-full">
        <LandingPageContent content={landingPage} />
      </div>
    </NavPageLayout>
  );
};

export default LandingPage;
