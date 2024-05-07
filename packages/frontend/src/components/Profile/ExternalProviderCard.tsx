import { HTMLAttributes}  from 'react';
import { Card, Text, Stack, Group, Button, Center } from '@mantine/core';
import { ExternalProvider } from '@gen3/core';

interface ExternalProviderCardProps extends HTMLAttributes<HTMLDivElement> {
  provider: ExternalProvider;
}

const ExternalProviderCard: React.FunctionComponent<ExternalProviderCardProps> = ({ provider }) => {
  return (
    <Card shadow="xs" className="p-4">
      <Stack gap="xs">
        <Text size="lg" weight={500}>{provider.name}</Text>
        <Group>
          <Text>IDP: {provider.idp}</Text>
          <Text>Provider URL: <a href={provider.base_url} target="_blank" rel="noreferrer">{provider.base_url}</a></Text>
          <Text>Status: {provider.refresh_token_expiration ? `expires in ${provider.refresh_token_expiration}` : 'not authorized'}</Text>
        </Group>
        <Center>
          {provider.urls.map((providerUrl, i) => (
            <Button
              key={i}
              className="external-login-option__button"
              icon={provider.refresh_token_expiration ? <ReloadOutlined /> : <LoginOutlined />}
            >
              {providerUrl.name}
            </Button>
          ))}
        </Center>
      </Stack>
    </Card>
  );
}
