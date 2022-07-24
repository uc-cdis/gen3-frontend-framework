import { CoreProvider } from '@gen3/core';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { addCollection } from '@iconify/react';
import icons from '../../config/icons/gen3.json';
import '@iconify/types';
import React from 'react';


const PortalApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  addCollection(icons);
  return (
    <SessionProvider session={pageProps.session}>
      <CoreProvider>
        <Component { ...pageProps} />
      </CoreProvider>
    </SessionProvider>
  );
};

export default PortalApp;
