import { useGetExternalLoginsQuery } from '@gen3/core';
import { Badge, Group } from '@mantine/core';

const ExternalLoginsStatus = () => {
  const {
    data: externalProviders,
    isLoading,
    isError,
    isSuccess,
  } = useGetExternalLoginsQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error occurred while fetching external logins</div>;
  }

  if (isSuccess) {
    const providersNeedToken = externalProviders.providers.filter(
      (option) => !option.refresh_token_expiration,
    );
    if (providersNeedToken.length > 0) {
      return (
        <Group>
          The following providers need a token:
          <Group>
            {providersNeedToken.map((provider) => (
              <Badge key={provider.name}>{provider.name}</Badge>
            ))}
          </Group>
        </Group>
      );
    }
    return null;
  }
};

export default ExternalLoginsStatus;
