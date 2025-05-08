import React from 'react';
import { ExternalProvider } from '@gen3/core';
import { Stack, Table, Text } from '@mantine/core';

interface ProviderErrorNotificationProps {
  message: string;
  providers: Array<ExternalProvider>;
}
export const ProvidersErrorPanel: React.FC<ProviderErrorNotificationProps> = ({
  message,
  providers,
}) => {
  return (
    <Stack>
      <Text>{message}</Text>
      <Table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.name}>
              <Text>{provider.name}</Text>
              <Text>{provider.base_url}</Text>
            </tr>
          ))}
        </tbody>
      </Table>
    </Stack>
  );
};
