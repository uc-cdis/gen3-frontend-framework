import React from 'react';
import { Box, Button, LoadingOverlay, Select, Stack } from '@mantine/core';
import { useGetLoginProvidersQuery } from '@gen3/core';
import type { Gen3LoginProvider, NameUrl } from '@gen3/core';

interface LoginPanelProps {
  readonly redirectURL?: string;
  readonly handleLoginSelected: (_: string, _2?: string) => void;
}

const LoginProvidersPanel = ({
  handleLoginSelected,
  redirectURL,
}: LoginPanelProps) => {
  const { data, isSuccess } = useGetLoginProvidersQuery();

  if (!isSuccess) {
    return <LoadingOverlay visible={!isSuccess} />;
  }
  return (
    <Box className="flex flex-col items-center justify-center">
      <Stack align="center" className="w-1/3">
        <Button
          fullWidth
          color="accent.3"
          onClick={() => handleLoginSelected(data.default_provider.url)}
        >
          {data.default_provider.name}
        </Button>
        {data?.providers.map((x: Gen3LoginProvider) => {
          if (x.name === data.default_provider.name) return null;
          if (x.urls.length == 1)
            return (
              <Button
                fullWidth
                key={x.name}
                color="accent.3"
                onClick={() => handleLoginSelected(x.urls[0].url, redirectURL)}
              >
                {' '}
                {x.name}{' '}
              </Button>
            );
          else {
            const selectData = x.urls.map((item: NameUrl) => ({
              value: item.url,
              label: item.name,
            }));
            return (
              <div className="flex flex-col w-full" key={`${x.name}-login-item`}>
                <Select  data={selectData}

                classNames = {
                      {
                        root: 'w-full',
                        item: 'font-medium hover:text-accent-light hover:font-bold',
                      }
                         }/>
                <Button
                  fullWidth
                  key={x.name}
                  color="accent.3"
                  onClick={() =>
                    handleLoginSelected(x.urls[0].url, redirectURL)
                  }
                >
                  {' '}
                  {x.name}
                </Button>
              </div>
            );
          }
        })}
      </Stack>
    </Box>
  );
};

export default LoginProvidersPanel;
