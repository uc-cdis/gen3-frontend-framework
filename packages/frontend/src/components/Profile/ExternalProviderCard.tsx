import { HTMLAttributes, useState } from 'react';
import { Card, Text, Stack, Group, Button, Center } from '@mantine/core';
import { type ExternalProvider, type NamedURL } from '@gen3/core';
import {
  IoMdRefresh as ReloadIcon,
  IoMdLogIn as LoginIcon,
} from 'react-icons/io';
import Link from 'next/link';
import { useDisclosure } from '@mantine/hooks';

/**
 * Open a new window for authentication.
 * @param url - URL to open
 * @param title - Title of the window
 */
const openAuthWindow = (url: string, title: string): Promise<unknown> => {
  const pollInterval = 500;
  return new Promise((resolve, reject) => {
    if (window.navigator.cookieEnabled) {
      const dualScreenLeft = window.screenLeft ?? window.screenX;
      const dualScreenTop = window.screenTop ?? window.screenY;

      const width =
        window.innerWidth ??
        document.documentElement.clientWidth ??
        screen.width;

      const height =
        window.innerHeight ??
        document.documentElement.clientHeight ??
        screen.height;

      const systemZoom = width / window.screen.availWidth;

      const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
      const top = (height - 550) / 2 / systemZoom + dualScreenTop;

      const win = window.open(
        url,
        title,
        `width=${500 / systemZoom},height=${
          550 / systemZoom
        },top=${top},left=${left}`,
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
            resolve('success');
          }
        } catch (err) {
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
}

const ExternalProviderCard: React.FunctionComponent<
  ExternalProviderCardProps
> = ({ provider }) => {
  const [loading, { toggle }] = useDisclosure();
  return (
    <Card withBorder radius="sm">
      <Card.Section withBorder inheritPadding py="xs">
        <Center>
          <Text truncate size="lg" weight={700} color="primary.4">
            <span aria-label="provider-name">{provider.name} </span>
          </Text>
        </Center>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <Stack spacing="md">
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
            onClick={() => {
              const queryChar = providerUrl.url.includes('?') ? '&' : '?';
              toggle();
              openAuthWindow(
                `${providerUrl.url}${queryChar}redirect=${window.location.pathname}`,
                provider.name,
              ).then(() => {
                toggle();
              });
            }}
            aria-label={`provider-button-${provider.name}`}
            leftIcon={
              provider.refresh_token_expiration ? (
                <ReloadIcon size="1.5rem" color="accent" />
              ) : (
                <LoginIcon size="1.5rem" color="accent" />
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
