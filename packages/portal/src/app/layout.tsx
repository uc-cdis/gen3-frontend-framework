import '../styles/globals.css';
import icons from '../../config/icons/gen3.json';
import '@iconify/types';
import React from 'react';
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

const RootLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Gen3Provider colors={colors} icons={icons}>
      {children}
    </Gen3Provider>
  );
};

export default RootLayout;
