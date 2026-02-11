import whyDidYouRender from '@welldone-software/why-did-you-render';
import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { MantineProvider, mergeThemeOverrides } from '@mantine/core';

import {
  type AuthorizedRoutesConfig,
  createMantineTheme,
  DefaultAuthorizedRoutesConfig,
  type Fonts,
  Gen3Provider,
  type ModalsConfig,
  registerCohortBuilderDefaultPreviewRenderers,
  RegisteredIcons,
  registerExplorerDefaultCellRenderers,
  registerMetadataSchemaApp,
  SessionConfiguration,
  TenStringArray,
} from '@gen3/frontend/app';
import { registerDefaultRemoteSupport, setDRSHostnames } from '@gen3/core';

import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';

import '../styles/globals.css';
import '@fontsource/montserrat';
import '@fontsource/source-sans-pro';
import '@fontsource/poppins';
import drsHostnames from '../../config/drsHostnames.json';
import { loadContent } from '@/lib/content/loadContent';
import Loading from '../components/Loading';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  whyDidYouRender(React);
}

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const ReactDOM = require('react-dom');
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}

type PublicConfig = {
  dataDogAppId: string | null;
  dataDogClientToken: string | null;
  dataCommons: string;
};

interface Gen3AppProps {
  icons: Array<RegisteredIcons>;
  modalsConfig: ModalsConfig;
  sessionConfig: SessionConfiguration;
  protectedRoutes: AuthorizedRoutesConfig;
  publicConfig?: PublicConfig;
  colors: Record<string, TenStringArray>;
  fonts: Fonts;
}

const Gen3App = ({
  Component,
  pageProps,
  icons,
  colors,
  fonts,
  sessionConfig,
  modalsConfig,
  protectedRoutes,
}: AppProps & Gen3AppProps) => {
  const isFirstRender = useRef(true);
  const [mantineTheme, setMantineTheme] =
    useState<Partial<ReturnType<typeof mergeThemeOverrides>>>();

  useEffect(() => {
    if (isFirstRender.current) {
      setDRSHostnames(drsHostnames);
      registerDefaultRemoteSupport();
      registerMetadataSchemaApp();
      // registerCohortDiscoveryApp();
      registerExplorerDefaultCellRenderers();
      registerCohortBuilderDefaultPreviewRenderers();
      registerCohortTableCustomCellRenderers();
      registerCustomExplorerDetailsPanels();
      isFirstRender.current = false;

      const gen3ThemeDynamic = createMantineTheme(fonts, colors);
      const mergedTheme = mergeThemeOverrides(gen3ThemeDynamic);
      setMantineTheme(mergedTheme);
    }
    console.log('Gen3 App initialized');
  }, []);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Only on client-side
  }, []);
  return (
    <React.Fragment>
      {isClient ? (
        <Suspense fallback={<Loading />}>
          <MantineProvider theme={mantineTheme}>
            <Gen3Provider
              icons={icons}
              sessionConfig={sessionConfig}
              modalsConfig={modalsConfig}
              protectedRoutesConfig={protectedRoutes}
            >
              <Component {...pageProps} />
            </Gen3Provider>
          </MantineProvider>
        </Suspense>
      ) : (
        // Show some fallback UI while waiting for the client to load
        <Loading />
      )}
    </React.Fragment>
  );
};

// TODO: replace with page router
Gen3App.getInitialProps = async (
  context: AppContext,
): Promise<Gen3AppProps & AppInitialProps> => {
  const ctx = await App.getInitialProps(context);

  try {
    const res = await loadContent();
    return {
      ...ctx,
      ...res,
    };
  } catch (error: any) {
    console.error('Provider Wrapper error loading config', error.toString());
  }
  // return default
  return {
    ...ctx,
    icons: [
      {
        prefix: 'gen3',
        lastModified: 0,
        icons: {},
        width: 0,
        height: 0,
      },
    ],
    modalsConfig: {},
    sessionConfig: {},
    colors: {},
    fonts: {
      heading: ['Poppins', 'sans-serif'],
      content: ['Poppins', 'sans-serif'],
      fontFamily: 'Poppins',
    },
    protectedRoutes: DefaultAuthorizedRoutesConfig,
  };
};
export default Gen3App;
