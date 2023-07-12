import { CoreProvider } from '@gen3/core';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { addCollection } from '@iconify/react';
import {
  MantineProvider,
  createEmotionCache,
  EmotionCache,
} from '@mantine/core';
import { coreStore, csrfApi } from '@gen3/core';
import { TenStringArray } from '../utils/types';
import { SessionProvider } from '../lib/session/session';
import { Notifications } from '@mantine/notifications';

export const initStore = async () => {
  coreStore.dispatch(csrfApi.endpoints.getCSRF.initiate());
};



const colors = Object.fromEntries(
  Object.entries(defaultTailwindColorTheme).map(([key, values]) => [
    key,
    Object.values(values) as TenStringArray,
  ]),
);

const getEmotionCache = (): EmotionCache => {
  // Insert mantine styles after global styles
  const insertionPoint =
    typeof document !== 'undefined'
      ? document.querySelectorAll<HTMLElement>(
        'styles[api-emotion="css-global"]',
      )?.[-1]
      : undefined;

  return createEmotionCache({ key: 'mantine', insertionPoint });
};

const PortalApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  addCollection(icons);
  initStore();
  return (
    <CoreProvider>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        emotionCache={getEmotionCache()}
        theme={{
          fontFamily: 'Montserrat, Noto Sans, sans-serif',
          colors: {
            ...colors,
            /*
             * This theme adds a named color for each of the primary and secondary
             * colors. The DEFAULT represent the value for those colors. The
             * shades from the extended palette are represented by the light,
             * lighter, lightest, dark, darker, and darkest modifiers. Each one
             * maps to every third shade.
             */
          },
          primaryColor: 'primary',
          primaryShade: { light: 4, dark: 7 },
          breakpoints: {
            xs: '500',
            sm: '800',
            md: '1000',
            lg: '1275',
            xl: '1800',
          },
        }}
      >
        <Notifications />
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
      </MantineProvider>
    </CoreProvider>
  );
};

export default PortalApp;
