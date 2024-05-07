import { useGetExternalLoginsQuery, type ExternalProvider } from '@gen3/core';


import { ExternalProviderCard } from './ExternalProviderCard';

const ExternalProvidersPanel = () => {

const { data : externalProviders, isLoading, isError, isSuccess } = useGetExternalLoginsQuery();

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900">External Providers</h2>
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
        {externalProviders.providers.map((provider:ExternalProvider) => (
          <ExternalProviderCard
            key={provider.id}
            provider={provider}
          />
        ))}
      </div>
    </div>
  );
}
