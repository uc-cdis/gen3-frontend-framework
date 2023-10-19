import React, { useEffect, ReactNode } from 'react';
import { CoreProvider } from '@gen3/core';
import {
  MantineProvider,
  createEmotionCache,
  EmotionCache,
} from '@mantine/core';
import { TenStringArray } from '../../utils';
import { SessionProvider } from '../../lib/session/session';
import { type RegisteredIcons, type Fonts } from '../../lib/content/types';
import { Notifications } from '@mantine/notifications';
import { addCollection } from '@iconify/react';

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

interface Gen3ProviderProps {
  colors: Record<string, TenStringArray>;
  icons: RegisteredIcons;
  fonts:  Fonts;
  children?: ReactNode | undefined;
}

const Gen3Provider: React.FC<Gen3ProviderProps> = ({
  colors,
  icons,
                                                     fonts,
  children,
}: Gen3ProviderProps) => {
  useEffect(() => {
    addCollection(icons);
  }, [icons]);

  return (
    <CoreProvider>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        emotionCache={getEmotionCache()}
        theme={{
          fontFamily: fonts.fontFamily,
          colors: {
            ...colors,
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
        <SessionProvider>{children}</SessionProvider>
      </MantineProvider>
    </CoreProvider>
  );
};

export default Gen3Provider;
