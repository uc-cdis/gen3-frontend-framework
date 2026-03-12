import React, { FC, ReactNode, useEffect } from 'react';
import { CoreProvider } from '@gen3/core';
import { createTheme, Modal, Pagination } from '@mantine/core';
import { TenStringArray } from '../../utils';
import { SessionProvider } from '../../lib/session/session';
import { type Fonts, type RegisteredIcons } from '../../lib/content/types';
import { ContextModalProps, ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { addCollection } from '@iconify-icon/react';
import { SessionConfiguration } from '../../lib/session/types';
import { gen3Modals, Gen3ModalsProvider, type ModalsConfig } from '../Modals';
import { AuthorizedRoutesConfig } from '../../lib/authz/type';
import ProtectedRoutesProvider from '../AuthorizedRoutes/ProtectedRoutesProvider';
import { CookiesProvider } from 'react-cookie';

interface Gen3ProviderProps {
  icons: Array<RegisteredIcons>;
  sessionConfig: SessionConfiguration;
  modalsConfig: ModalsConfig;
  contextModals?: Record<string, FC<ContextModalProps<any>>>;
  protectedRoutesConfig?: AuthorizedRoutesConfig;
  children?: ReactNode | undefined;
  defaultNotificationPosition?:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center';
}

// define CSS Variables for document.styleSheets[0]
export const createCSSVariables = (colors: Record<string, string>) => {
  Object.entries(colors).forEach(([key, values]) => {
    Object.entries(values).forEach(([name, color]) => {
      if (color) {
        const colorName = name !== 'DEFAULT' ? '-' + name : '';
        document.documentElement.style.setProperty(
          `--${key}${colorName}`,
          color,
        );
      }
    });
  });
};

// Define theme for mantine v7
export const createMantineTheme = (
  fonts: Fonts,
  colors: Record<string, TenStringArray>,
) => {
  const theme = createTheme({
    // use V2 font in MantineProvider
    fontFamily: fonts.fontFamily,
    colors: Object.fromEntries(
      Object.entries(colors).map(([key, values]) =>
        values ? [key, Object.values(values)] : [],
      ),
    ),
    primaryColor: 'primary',
    breakpoints: {
      xs: '31.25em',
      sm: '50em',
      md: '62.5em',
      lg: '80em',
      xl: '112.5em',
    },
    components: {
      Modal: Modal.extend({
        defaultProps: {
          zIndex: 400,
          radius: 'md',
          closeButtonProps: { 'aria-label': 'Close Modal' },
          styles: {
            header: {
              backgroundColor: 'var(--mantine-color-primary-3)',
              borderColor: 'var(--mantine-color-base-3)',
              borderStyle: 'solid',
              borderWidth: '0px 0px 2px 0px',
              padding: '15px 15px 15px 15px',
              minHeight: '0',
            },
            title: {
              color: 'var(--mantine-color-primary-contrast-3)',
              fontFamily: '"Montserrat", "sans-serif"',
              fontSize: '1.05em',
              fontWeight: 500,
              letterSpacing: '.1rem',
              textTransform: 'uppercase',
            },
            body: {
              padding: '0.5rem',
            },
            close: {
              backgroundColor: 'var(--mantine-color-accent-3)',
              color: 'var(--mantine-color-accent-contrast-3)',
            },
          },
        },
      }),
      Pagination: Pagination.extend({
        defaultProps: {
          getControlProps: (control) => {
            //Add 508 localization to Pagination, not needed if using react table
            if (control === 'first') {
              return { 'aria-label': 'First' };
            }
            if (control === 'last') {
              return { 'aria-label': 'Last' };
            }
            if (control === 'next') {
              return { 'aria-label': 'Next' };
            }
            if (control === 'previous') {
              return { 'aria-label': 'Previous' };
            }
            return {};
          },
        },
      }),
    },
  });

  return theme;
};

/**
 * Gen3Provider wraps around the entire app and provides general configurations
 * for the whole website like color scheme, icons, fonts, and sessionConfigs like
 * inactivity limits for session timeouts.
 */
const Gen3Provider = ({
  icons,
  sessionConfig,
  modalsConfig,
  contextModals = {},
  protectedRoutesConfig,
  defaultNotificationPosition = 'top-center',
  children,
}: Gen3ProviderProps) => {
  useEffect(() => {
    icons.forEach((i) => addCollection(i));
  }, [icons]);

  return (
    <CoreProvider>
      <CookiesProvider>
        <ModalsProvider modals={{ ...contextModals, ...gen3Modals }}>
          <Notifications position={defaultNotificationPosition} />
          <SessionProvider {...sessionConfig}>
            <ProtectedRoutesProvider
              config={
                protectedRoutesConfig ?? {
                  routes: {
                    '/DataLibrary': {
                      loginRequired: true,
                    },
                    '/Workspace': {
                      loginRequired: true,
                    },
                    '/Profile': {
                      loginRequired: true,
                    },
                    '*': {
                      loginRequired: false,
                    },
                  },
                }
              }
            >
                <Gen3ModalsProvider config={modalsConfig}>
                  {children}
                </Gen3ModalsProvider>
            </ProtectedRoutesProvider>
          </SessionProvider>
        </ModalsProvider>
      </CookiesProvider>
    </CoreProvider>
  );
};

export default Gen3Provider;
