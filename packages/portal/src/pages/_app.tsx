import type { AppProps } from 'next/app';
import '../styles/globals.css';
import icons from '../../config/icons/gen3.json';
import Gen3Provider from '../components/Providers/Gen3Provider';
import colorTheme from '../../config/theme.json';
import '@iconify/types';
import React from 'react';
import { coreStore, csrfApi } from '@gen3/core';
import { TenStringArray } from '@/utils/types';
import { registerSitePlugins } from '../../config/registerSitePlugins';

export const initStore = async () => {
  coreStore.dispatch(csrfApi.endpoints.getCSRF.initiate());
};

registerSitePlugins();

const colors = Object.fromEntries(
  Object.entries(colorTheme).map(([key, values]) => [
    key,
    Object.values(values) as TenStringArray,
  ]),
);

const PortalApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  initStore();
  return (
    <Gen3Provider colors={colors} icons={icons}>
      <Component {...pageProps} />
    </Gen3Provider>
  );
};

export default PortalApp;
