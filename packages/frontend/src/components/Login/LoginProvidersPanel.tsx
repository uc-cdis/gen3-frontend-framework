import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  LoadingOverlay,
  Select,
  Stack,
} from '@mantine/core';
import {
  type Gen3LoginProvider,
  type NameUrl,
  useGetLoginProvidersQuery,
} from '@gen3/core';
import { LoginSelectedProps } from './types';
import { ErrorCard } from '../MessageCards';

interface LoginProviderItemProps extends LoginSelectedProps {
  readonly provider: Gen3LoginProvider;
}

const LoginProviderMultipleItems = ({
  provider,
  handleLoginSelected,
}: LoginProviderItemProps) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div
      className="flex flex-col w-full font-medium hover:text-accent-light hover:font-bold"
      key={`${provider.name}-login-item`}
    >
      <Select
        data={provider.urls.map((item: NameUrl) => ({
          value: item.url,
          label: item.name,
        }))}
        classNames={{
          root: 'w-full',
          // item: 'font-medium hover:text-accent-light hover:font-bold',
        }}
        onChange={setValue}
        value={value}
      />
      <Button
        fullWidth
        key={provider.name}
        color="accent.3"
        disabled={!value}
        onClick={() => value && handleLoginSelected(value)}
      >
        {' '}
        {provider.name}
      </Button>
    </div>
  );
};

const LoginProviderSingleItem = ({
  provider,
  handleLoginSelected,
}: LoginProviderItemProps) => {
  return (
    <Button
      fullWidth
      key={provider.name}
      color="accent.3"
      onClick={() => handleLoginSelected(provider.urls[0].url)}
    >
      {' '}
      {provider.name}{' '}
    </Button>
  );
};

const LoginProvidersPanel = ({ handleLoginSelected }: LoginSelectedProps) => {
  const { data, isSuccess, isError, isLoading, isFetching } =
    useGetLoginProvidersQuery();

  if (isError) {
    return (
      <Center>
        <ErrorCard message={'request to authentication service failed'} />
      </Center>
    );
  }

  if (isLoading || isFetching) {
    return <LoadingOverlay visible={!isSuccess} />;
  }

  if (isSuccess && !data) {
    return (
      <Center>
        <ErrorCard message={'no logins defined'} />
      </Center>
    );
  }

  return (
    <Box className="flex flex-col items-center justify-center">
      <Stack align="center" className="w-1/3">
        {data && data.default_provider.urls.length > 1 ? (
          <LoginProviderMultipleItems
            provider={data.default_provider}
            handleLoginSelected={handleLoginSelected}
          />
        ) : (
          data && (
            <LoginProviderSingleItem
              provider={data.default_provider}
              handleLoginSelected={handleLoginSelected}
            />
          )
        )}
        {data?.providers
          .filter((x: any) => x.name !== data.default_provider.name)
          .map((x: Gen3LoginProvider) =>
            x.urls.length > 1 ? (
              <LoginProviderMultipleItems
                key={x.name}
                provider={x}
                handleLoginSelected={handleLoginSelected}
              />
            ) : (
              <LoginProviderSingleItem
                key={x.name}
                provider={x}
                handleLoginSelected={handleLoginSelected}
              />
            ),
          )}
      </Stack>
    </Box>
  );
};

export default LoginProvidersPanel;
