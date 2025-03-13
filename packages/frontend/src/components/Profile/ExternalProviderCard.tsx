import React, { HTMLAttributes, useEffect } from 'react';
import { Card, Text, Stack, Button, Center } from '@mantine/core';
import { type ExternalProvider, type NamedURL } from '@gen3/core';
import {
  IoMdRefresh as ReloadIcon,
  IoMdLogIn as LoginIcon,
} from 'react-icons/io';
import Link from 'next/link';
import { useDisclosure } from '@mantine/hooks';
import {
  QueryActionCreatorResult,
  QueryDefinition,
} from '@reduxjs/toolkit/query';

/**
 * Open a new window for authentication.
 * @param url - URL to open
 * @param title - Title of the window
 * @param refetch - refetch the external status if successful
 */
const openAuthWindow = (
  url: string,
  title: string,
  refetch: () => QueryActionCreatorResult<
    QueryDefinition<any, any, any, any, string>
  >,
): Promise<unknown> => {
  const pollInterval = 500;
  return new Promise((resolve, reject) => {
    if (window.navigator.cookieEnabled) {
      const width = Math.max(1024, window.innerWidth / 2);
      const height = Math.max(1024, window.innerHeight / 2);
      const dualScreenLeft = window.screenLeft ?? window.screenX;
      const dualScreenTop = window.screenTop ?? window.screenY;
      const left = dualScreenLeft + (window.innerWidth - width) / 2;
      const top = dualScreenTop + (window.innerHeight - height) / 2;
      const win = window.open(
        url,
        title,
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!win) {
        reject('Popup blocked');
        return;
      }
      win?.focus();

      const loginAttempt = () => {
        if (win.closed) {
          clearInterval(interval);
          reject('window closed manually');
        }
        try {
          if (
            win.document.URL.includes(location.origin) &&
            !win.document.URL.includes('auth')
          ) {
            win.close();
            clearInterval(interval);
            if (win.document.URL.includes('error=401')) {
              reject('login_error');
              return;
            }
            refetch();
            resolve('success');
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err: unknown) {
          // We just want to catch it and not reject it. Rejecting the promise leads to unexpected behavior
          // where the logged-in status isn't reflected immediately as the program moves ahead w/o users
          // having a chance to log in, requiring a manual screen refresh to update. By catching errors
          // instead of rejecting, we avoid the issue where browser complains about cross origin
          // and ensure a smoother user experience where the promise chain continues until we login and we
          // avoid pre-maturely triggering calls which fetches user info.
        }
      };
      const interval = setInterval(loginAttempt, pollInterval);
    } else {
      reject('No cookies enabled');
    }
  });
};

interface ExternalProviderCardProps extends HTMLAttributes<HTMLDivElement> {
  provider: ExternalProvider;
  refetch: () => QueryActionCreatorResult<
    QueryDefinition<any, any, any, any, string>
  >;
}

const ExternalProviderCard: React.FunctionComponent<
  ExternalProviderCardProps
> = ({ provider, refetch }) => {
  const [loading, handler] = useDisclosure();
  return (
    <Card withBorder radius="sm">
      <Card.Section withBorder inheritPadding py="xs">
        <Center>
          <Text truncate size="lg" fw={700} color="primary.4">
            <span aria-label="provider-name">{provider.name} </span>
          </Text>
        </Center>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <Stack gap="md">
          <div className="flex flex-nowrap justify-between items-center">
            <Text>IDP</Text>
            <Text truncate aria-label="provider-idp">
              {provider.idp}
            </Text>
          </div>
          <div className="flex flex-nowrap justify-between items-center">
            <Text truncate>Provider URL</Text>
            <Link href={provider.base_url} target="_blank" rel="noreferrer">
              <Text truncate color="utility.0" aria-label="provider-base-url">
                {provider.base_url}
              </Text>
            </Link>
          </div>
          <div className="flex flex-nowrap justify-between items-center">
            <Text truncate>Status</Text>
            <Text truncate aria-label="provider-status">
              {provider.refresh_token_expiration
                ? `Expires in ${provider.refresh_token_expiration}`
                : 'Not authorized'}
            </Text>
          </div>
        </Stack>
      </Card.Section>
      <Card.Section inheritPadding p="sm">
        {provider.urls.map((providerUrl: NamedURL, i: number) => (
          <Button
            variant="outline"
            fullWidth
            size="md"
            color="accent"
            disabled={loading}
            key={`${providerUrl.url}-${i}`}
            onClick={async () => {
              const queryChar = providerUrl.url.includes('?') ? '&' : '?';
              handler.open();
              openAuthWindow(
                `${providerUrl.url}${queryChar}redirect=${window.location.pathname}`,
                provider.name,
                refetch,
              ).finally(() => {
                handler.close();
              });
            }}
            aria-label={`provider-button-${provider.name}`}
            leftSection={
              provider.refresh_token_expiration ? (
                <ReloadIcon
                  size="1.5rem"
                  className="text-accent data-disabled:opacity-50"
                />
              ) : (
                <LoginIcon
                  size="1.5rem"
                  className="text-accent disabled:text-accent/50"
                />
              )
            }
          >
            <span aria-hidden={true}>
              {provider.refresh_token_expiration
                ? `Refresh ${providerUrl.name}`
                : `Authorize ${providerUrl.name}`}
            </span>
          </Button>
        ))}
      </Card.Section>
    </Card>
  );
};

export default ExternalProviderCard;
