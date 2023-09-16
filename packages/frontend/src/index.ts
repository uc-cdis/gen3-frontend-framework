export * from './features/Navigation';
export * from './features/Discovery';
export * from './features/Login';
export * from './components/Profile';
export * from './utils/';

import Gen3Provider from './components/Providers/Gen3Provider';
import DiscoveryPage from './pages/Discovery/Discovery';
import { getServerSideProps as DiscoveryPageServerSideProps } from './pages/Discovery';

import QueryPage from './pages/Query/Query';
import { getServerSideProps as QueryPageServerSideProps } from './pages/Discovery';
import { TailwindConfig } from './utils/tailwindConfig';
export {
  DiscoveryPage,
  DiscoveryPageServerSideProps,
  QueryPage,
  QueryPageServerSideProps,
  TailwindConfig,
  Gen3Provider
};
