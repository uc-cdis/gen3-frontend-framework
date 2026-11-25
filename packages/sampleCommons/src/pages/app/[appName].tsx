import React from 'react';
import {
  GEN3_COMMONS_NAME,
  selectGen3AppByName,
  useCoreSelector,
} from '@gen3/core';
import type { GetServerSideProps } from 'next';
import type { NextRouter } from 'next/dist/client/router';
import { useRouter } from 'next/dist/client/router';

import type { NavPageLayoutProps } from '@gen3/frontend';
import {
  ContentSource,
  ErrorCard,
  getNavPageLayoutPropsFromConfig,
  NavPageLayout,
} from '@gen3/frontend';

interface AppConfig extends NavPageLayoutProps {
  config?: Record<string, any> | null;
  configError?: boolean;
}

// app names are used to build a config file path, so keep them to a safe charset
const VALID_APP_NAME = /^[A-Za-z0-9_-]+$/;

const AppsPage = ({
  headerProps,
  footerProps,
  config,
  configError,
}: AppConfig) => {
  const router = useRouter();
  const appName = getAppName(router);

  const Gen3App = useCoreSelector(
    () => selectGen3AppByName(appName), // TODO update ById to ByName
  ) as React.ElementType;

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 App Page',
        content: 'App Data',
        key: 'gen3-app-page',
        ...(config?.headerMetadata ? config.headerMetadata : {}),
      }}
    >
      {configError ? (
        <ErrorCard
          message={`Unable to load configuration for app ${appName}`}
        />
      ) : (
        Gen3App && <Gen3App {...config} />
      )}
    </NavPageLayout>
  );
};

const getAppName = (router: NextRouter): string => {
  const { appName } = router.query;
  if (typeof appName === 'string') return appName;
  else if (typeof appName === 'object') return appName[0];

  return 'UNKNOWN_APP_ID';
};

export const getServerSideProps: GetServerSideProps<AppConfig> = async (
  context,
) => {
  const { appName } = context.query;

  if (typeof appName !== 'string' || !VALID_APP_NAME.test(appName)) {
    return { notFound: true };
  }

  const configPath = `${GEN3_COMMONS_NAME}/apps/${appName}.json`;
  const contentDb = ContentSource.getContentDatabase();

  try {
    // some apps don't require a configuration file
    const config: Record<string, any> = (await contentDb.exists(configPath))
      ? await contentDb.get(configPath)
      : {};

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: null,
        configError: true,
      },
    };
  }
};

export default AppsPage;
