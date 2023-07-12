
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import icons from '../../config/icons/gen3.json';
import '@iconify/types';
import React from 'react';
import {

  createEmotionCache,
  EmotionCache,
} from '@mantine/core';
import { coreStore, csrfApi } from '@gen3/core';
import { TenStringArray } from '@/utils/types';
import { registerSitePlugins } from '../../config/registerSitePlugins';
import Gen3Provider from '../components/Providers/Gen3Provider';
import colorTheme from '../../config/theme.json';
import '../styles/globals.css';

const colors = Object.fromEntries(
  Object.entries(colorTheme).map(([key, values]) => [
    key,
    Object.values(values) as TenStringArray,
  ]),
);



registerSitePlugins();

const getEmotionCache = (): EmotionCache => {
  // Insert mantine styles after global styles
  const insertionPoint =
    typeof document !== 'undefined'
      ? document.querySelectorAll<HTMLElement>(
        'style[api-emotion="css-global"]',
      )?.[-1]
      : undefined;

  return createEmotionCache({ key: 'mantine', insertionPoint });
};

const PortalApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <Gen3Provider colors={colors} icons={icons}>
      <Component {...pageProps} />
    </Gen3Provider>
  );
};

export default PortalApp;
