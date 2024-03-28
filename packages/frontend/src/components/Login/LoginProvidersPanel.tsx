import React, { useState } from 'react';
import { Box, Button, LoadingOverlay, Select, Stack } from '@mantine/core';
import type { Gen3LoginProvider, NameUrl } from '@gen3/core';
import { useGetLoginProvidersQuery } from '@gen3/core';
import { LoginRedirectProps } from './types';

interface LoginProviderItemProps  extends LoginRedirectProps {
  readonly provider: Gen3LoginProvider;
}

const LoginProviderMultipleItems = ({ provider, handleLoginSelected, redirectURL }: LoginProviderItemProps) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="flex flex-col w-full" key={`${provider.name}-login-item`}>
      <Select
        data={provider.urls.map((item: NameUrl) => ({
          value: item.url,
          label: item.name,
        }))}
        classNames={
          {
            root: 'w-full',
            item: 'font-medium hover:text-accent-light hover:font-bold',
          }
        }
        onChange={ setValue}
        value={value}
      />
      <Button
        fullWidth
        key={provider.name}
        color="accent.3"
        disabled={!value}
        onClick={() => handleLoginSelected(value ?? '', redirectURL)}
      >
        {' '}
        {provider.name}
      </Button>
    </div>
  );
};

const LoginProviderSingleItem = ({ provider, handleLoginSelected, redirectURL }: LoginProviderItemProps) => {
    return (
      <Button
        fullWidth
        key={provider.name}
        color="accent.3"
        onClick={() => handleLoginSelected(provider.urls[0].url, redirectURL)}
      >
        {' '}
        {provider.name}{' '}
      </Button>
    );
};



const LoginProvidersPanel = ({
  handleLoginSelected,
  redirectURL,
}: LoginRedirectProps) => {
  const { data, isSuccess } = useGetLoginProvidersQuery();

  if (!isSuccess) {
    return <LoadingOverlay visible={!isSuccess} />;
  }
  return (
    <Box className="flex flex-col items-center justify-center">
      <Stack align="center" className="w-1/3">
        {
          data.default_provider.urls.length > 1 ? <LoginProviderMultipleItems provider={data.default_provider} handleLoginSelected={handleLoginSelected} redirectURL={data.default_provider.url} /> :
        <LoginProviderSingleItem provider={data.default_provider} handleLoginSelected={handleLoginSelected} redirectURL={redirectURL} />
        }
        {
          data?.providers.filter((x) => x.name !== data.default_provider.name).map((x: Gen3LoginProvider) =>
            x.urls.length > 1 ? <LoginProviderMultipleItems key={x.name} provider={x} handleLoginSelected={handleLoginSelected} redirectURL={redirectURL} /> :
            <LoginProviderSingleItem key={x.name} provider={x} handleLoginSelected={handleLoginSelected} redirectURL={redirectURL} />)
        }

      </Stack>
    </Box>
  );
};

export default LoginProvidersPanel;
