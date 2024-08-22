import React from 'react';
import renderer from 'react-test-renderer';
import LandingPage from '../Landing';
import { NavPageLayoutProps } from '../../../features/Navigation';
import { LandingPageProps } from '../../../components/Content/LandingPageContent';

// Mock Props if necessary
const mockNavPageLayoutProps: NavPageLayoutProps = {
  // Define your mock props here
  headerProps: {
    /* Mock header props */
  },
  footerProps: {
    /* Mock footer props */
  },
};

const mockLandingPageProps: LandingPageProps = {
  // Define your mock landing page properties here
};

// Describe the test suite
describe('LandingPage Component', () => {
  it('should match the snapshot', () => {
    const tree = renderer
      .create(
        <LandingPage
          {...mockNavPageLayoutProps}
          landingPage={mockLandingPageProps}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
