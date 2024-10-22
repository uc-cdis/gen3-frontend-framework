import React from 'react';

// if we want to use MDX
// import LandingPageMDX from "../../content/landing.mdx"
import LandingPageContent, {
  LandingPageProps,
} from '../../components/Content/LandingPageContent';
import NavPageLayout, {
  NavPageLayoutProps,
} from '../../features/Navigation/NavPageLayout';

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const LandingPage = ({ headerProps, footerProps, landingPage }: Props) => {
  return (
    <NavPageLayout
      {...{ footerProps, headerProps }}
      headerData={{
        title: 'Gen3 Home Page',
        content: 'Home page',
        key: 'gen3-home-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <LandingPageContent content={landingPage} />
      </div>
    </NavPageLayout>
  );
};

export default LandingPage;
