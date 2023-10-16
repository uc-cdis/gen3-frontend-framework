export * from './features/Navigation';
export * from './features/Discovery';

export * from './components/Login';
export * from './components/Profile';
export * from './utils/';

import { getNavPageLayoutPropsFromConfig } from './lib/common/staticProps';

// export Gen3 data UI standard pages
import Gen3Provider from './components/Providers/Gen3Provider';
import DiscoveryPage from './pages/Discovery/Discovery';
import { DiscoveryPageGetServerSideProps } from './pages/Discovery/data';

import QueryPage from './pages/Query/Query';
import { QueryPageGetServerSideProps } from './pages/Query/data';

import LandingPage from './pages/Landing/Landing';
import { LandingPageGetStaticProps } from './pages/Landing/data';

import ExplorerPage from './pages/Explorer/Explorer';
import { ExplorerPageGetServerSideProps } from './pages/Explorer/data';

import ColorThemePage from './pages/Theme/Colors';
import { ColorThemePageGetServerSideProps } from './pages/Theme';

import ProfilePage, { ProfilePageGetServerSideProps } from './pages/Profile';
import LoginPage, { LoginPageGetServerSideProps } from './pages/Login';

import { TailwindConfig } from './utils/tailwindConfig';

export {
  DiscoveryPage,
  DiscoveryPageGetServerSideProps,
  QueryPage,
  QueryPageGetServerSideProps,
  LandingPage,
  LandingPageGetStaticProps,
  ColorThemePage,
  ColorThemePageGetServerSideProps,
  ExplorerPage,
  ExplorerPageGetServerSideProps,
  ProfilePage,
  ProfilePageGetServerSideProps,
  LoginPage,
  LoginPageGetServerSideProps,
  TailwindConfig,
  Gen3Provider,
  getNavPageLayoutPropsFromConfig,
};
