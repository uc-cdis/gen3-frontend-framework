import { useGetExternalLoginsQuery, type ExternalProvider } from '@gen3/core';
import { useMemo } from 'react';


import  ExternalProviderCard  from './ExternalProviderCard';
import { LoadingOverlay } from '@mantine/core';

const ExternalProvidersPanel = () => {

const { data : externalProviders, isLoading, isError, isSuccess } = useGetExternalLoginsQuery();

  const providerCards = useMemo(() => externalProviders ? externalProviders.providers.map((provider:ExternalProvider) => (
    <ExternalProviderCard
      key={provider.base_url}
      provider={provider}
    />
  )) : null, [externalProviders]);


  return (
    <div className="mt-6 relative">
      <LoadingOverlay visible={isLoading} />
      {isError && <div role="alert">Error loading external providers</div>}
      {isSuccess && (<div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" role="listbox">
        {providerCards}
      </div>)}
    </div>
  );
};

export default ExternalProvidersPanel;
