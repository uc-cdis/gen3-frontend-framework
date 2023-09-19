export * from './features/Navigation';
export * from './features/Discovery';
export * from './features/Login';
export * from './components/Profile';
export * from './utils/';

// export Gen3 data UI standard pages
import Gen3Provider from './components/Providers/Gen3Provider';
import DiscoveryPage from './pages/Discovery/Discovery';
import { DiscoveryPageGetServerSideProps } from './pages/Discovery/data';

import QueryPage from './pages/Query/Query';
import { QueryPageGetServerSideProps } from './pages/Query/data';
import { TailwindConfig } from './utils/tailwindConfig';

export {
  DiscoveryPage,
  DiscoveryPageGetServerSideProps,
  QueryPage,
  QueryPageGetServerSideProps,
  TailwindConfig,
  Gen3Provider
};
