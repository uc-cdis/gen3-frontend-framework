export * from './features/Navigation';
export * from './features/Discovery';
export * from './features/Login';
export * from './components/Profile';
export * from './pages/Discovery/Discovery';
export * from './utils/';

import DiscoveryPage from './pages/Discovery/Discovery';
import { getServerSideProps as DiscoveryPageServerSideProps } from './pages/Discovery';

import QueryPage from './pages/Query/Query';
import { getServerSideProps as QueryPageServerSideProps } from './pages/Discovery';

export {
  DiscoveryPage,
  DiscoveryPageServerSideProps,
  QueryPage,
  QueryPageServerSideProps,
};

export { default as Gen3Provider } from './components/Providers/Gen3Provider';
import { TailwindConfig } from './utils/tailwindConfig';
export { TailwindConfig };
