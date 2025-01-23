import { useGetExternalLoginsQuery } from '@gen3/core';
import { Badge, Center, Group, Loader, Stack, Text } from '@mantine/core';

const ExternalLoginsStatus = () => {
  const {
    data: externalProviders,
    isLoading,
    isError,
    isSuccess,
  } = useGetExternalLoginsQuery();

  if (isLoading) {
    return (
      <div className="bg-primary h-24 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center w-full p-1">
        <Text fw={500}>Error occurred while fetching external logins</Text>
      </div>
    );
  }

  if (isSuccess) {
    const providersNeedToken = externalProviders.providers.filter(
      (option) => !option.refresh_token_expiration,
    );
    if (providersNeedToken.length > 0) {
      return (
        <div className="p-2 border border-base-lighter pb-4">
          <Stack>
            <Text>
              To analyze all data to which you have access, please authorize
              these external data resources in the Profile page:{' '}
            </Text>
            <Group gap="xs">
              {providersNeedToken.map((provider) => (
                <Badge
                  size="lg"
                  variant="outline"
                  radius="sm"
                  key={provider.name}
                >
                  {provider.name}
                </Badge>
              ))}
            </Group>
          </Stack>
        </div>
      );
    }
    return null;
  }
};

export default ExternalLoginsStatus;
