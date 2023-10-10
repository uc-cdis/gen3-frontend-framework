import React from 'react';

// if we want to use MDX
// import LandingPageMDX from "../../content/landing.mdx"
import LandingPageContent, { LandingPageProps } from '../../components/Content/LandingPageContent';
import NavPageLayout, { NavPageLayoutProps } from '../../features/Navigation/NavPageLayout';

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const LandingPage = ({ headerProps, footerProps, landingPage }: Props) => {
  return (
    <NavPageLayout {...{ footerProps, headerProps }}>
      <div className="flex flex-row justify-items-center">
        <LandingPageContent content={landingPage} />
      </div>
    </NavPageLayout>
  );
};

export default LandingPage;
