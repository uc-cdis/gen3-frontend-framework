import App, { AppProps, AppContext, AppInitialProps } from 'next/app';
import { useEffect } from 'react';
import {
  Gen3Provider,
  TenStringArray,
  type ModalsConfig,
  ContentSource,
  RegisteredIcons,
  Fonts,
  SessionConfiguration,
} from '@gen3/frontend';
import '../styles/globals.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'graphiql/graphiql.css';
import '@graphiql/react/dist/style.css';
import { setDRSHostnames } from '@gen3/core';
//import dynamic from 'next/dynamic';

//const sessionConfig = dynamic(() =>  import('../../config/session.json'));
//const modalsConfig = dynamic(() => import('../../config/modals.json'));
//const drsHostnames = dynamic(() => import('../../config/drsHostnames.json'));

import sessionConfig from '../../config/session.json';
import modalsConfig from '../../config/modals.json';
import drsHostnames from '../../config/drsHostnames.json';

interface Gen3AppProps {
  colors: Record<string, TenStringArray>;
  icons: RegisteredIcons;
  themeFonts: Fonts;
  modalsConfig: ModalsConfig;
  sessionConfig: SessionConfiguration;
}

const Gen3App = ({
  Component,
  pageProps,
  colors,
  icons,
  themeFonts,
  sessionConfig,
  modalsConfig,
}: AppProps & Gen3AppProps) => {
  useEffect(() => {
    setDRSHostnames(drsHostnames);
  }, []);

  return (
    <Gen3Provider
      colors={colors}
      icons={icons}
      fonts={themeFonts}
      sessionConfig={sessionConfig}
      modalsConfig={modalsConfig}
    >
      <Component {...pageProps} />
    </Gen3Provider>
  );
}
