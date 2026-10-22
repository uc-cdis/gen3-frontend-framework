import type { ReactElement, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Button, type ButtonProps } from '@mantine/core';
import { useIsUserLoggedIn } from '@gen3/core';

export interface LoginGateProps {
  /** Rendered as-is when the user is logged in. */
  children: ReactNode;
  /** Optional custom unauthenticated UI; receives a ready-made login handler. */
  fallback?: (props: { onLogin: () => void }) => ReactNode;
  loginLabel?: string;
  loginButtonProps?: ButtonProps;
  externalLoginUrl?: string;
}

export const LoginGate = ({
  children,
  fallback,
  loginLabel = 'Login to Download',
  loginButtonProps,
  externalLoginUrl,
}: LoginGateProps): ReactElement => {
  const router = useRouter();
  const isLoggedIn = useIsUserLoggedIn();

  if (isLoggedIn) return <>{children}</>;

  const onLogin = () =>
    router.push(
      externalLoginUrl ??
        `/Login?redirect=${encodeURIComponent(router.asPath)}`,
    );

  return (
    <>
      {fallback ? (
        fallback({ onLogin })
      ) : (
        <Button {...loginButtonProps} onClick={onLogin}>
          {loginLabel}
        </Button>
      )}
    </>
  );
};
