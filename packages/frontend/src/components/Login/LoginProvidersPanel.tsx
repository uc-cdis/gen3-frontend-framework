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
import TextContent, { TextContentProps } from '../Content/TextContent';

interface LoginProviderItemProps extends LoginSelectedProps {
  readonly provider: Gen3LoginProvider;
}

const logninExtraText = (extra: ReadonlyArray<TextContentProps>) => {
  return extra?.map((content, index) => (
          <TextContent {...content} key={index} />
        ));
}

const LoginProviderMultipleItems = ({
  provider,
  handleLoginSelected,
  loginProviderExtra,
}: LoginProviderItemProps) => {
  const [value, setValue] = useState<string | null>(null);
  const extra = loginProviderExtra && loginProviderExtra[provider.name];
  return (
    <div
      className="flex flex-col w-full font-medium hover:text-accent-light hover:font-bold"
      key={`${provider.name}-login-item`}
    >
      {extra && logninExtraText(extra)}
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
        searchable
        label={provider.name}
        placeholder="Select a login provider"
        size="sm"
        clearable
        aria-label="Select a login provider"
      />
      <Button
        fullWidth
        key={provider.name}
        color="accent.3"
        disabled={!value}
        classNames={{ root: 'data-disabled:bg-accent-lightest' }}
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
  loginProviderExtra,
}: LoginProviderItemProps) => {
  const extra = loginProviderExtra && loginProviderExtra[provider.name];
  return (
    <React.Fragment>
      {extra && logninExtraText(extra)}
      <Button
        fullWidth
        key={provider.name}
        color="accent.3"
        onClick={() => handleLoginSelected(provider.urls[0].url)}
      >
        {' '}
        {provider.name}{' '}
      </Button>
    </React.Fragment>
  );
};

const LoginProvidersPanel = ({ handleLoginSelected, loginProviderExtra }: LoginSelectedProps) => {
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
            loginProviderExtra={loginProviderExtra}
          />
        ) : (
          data && (
            <LoginProviderSingleItem
              provider={data.default_provider}
              handleLoginSelected={handleLoginSelected}
              loginProviderExtra={loginProviderExtra}
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
                loginProviderExtra={loginProviderExtra}
              />
            ) : (
              <LoginProviderSingleItem
                key={x.name}
                provider={x}
                handleLoginSelected={handleLoginSelected}
                loginProviderExtra={loginProviderExtra}
              />
            ),
          )}
      </Stack>
    </Box>
  );
};

export default LoginProvidersPanel;
