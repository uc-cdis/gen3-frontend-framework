import React, { type ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@mantine/core';
import { FiRefreshCw } from 'react-icons/fi';
import { ErrorCard } from '../../components/MessageCards';
import { canRetry, errorMessage } from './utils';

interface SearchErrorProps {
  status?: number | string;
  // Sends the same request again, page and all
  onRetry?: () => void;
}

const SearchError = ({ status, onRetry }: SearchErrorProps): ReactElement => {
  const router = useRouter();
  // Same as ProtectedContent
  const logIn = () =>
    void router.push({
      pathname: '/Login',
      query: { referer: router.asPath },
    });

  return (
    <div className="flex flex-col items-center gap-2">
      <ErrorCard message={errorMessage(status)} />
      {onRetry && canRetry(status) && (
        <Button
          size="xs"
          variant="default"
          leftSection={<FiRefreshCw />}
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
      {status === 401 && (
        <Button size="xs" onClick={logIn}>
          Log in
        </Button>
      )}
    </div>
  );
};

export default SearchError;
