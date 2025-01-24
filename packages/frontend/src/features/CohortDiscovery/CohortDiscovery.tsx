import React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { useGetCSRFQuery } from '@gen3/core';
import { Title, Center, Loader, Tabs } from '@mantine/core';
import { CohortDiscoveryConfig } from './types';
import IndexPanel from './IndexPanel';
import { AppStore } from './appApi';
import Image from 'next/image';

const persistor = persistStore(AppStore);

const CohortDiscovery = (config: CohortDiscoveryConfig) => {
  const { isLoading } = useGetCSRFQuery(); // need for Guppy

  if (isLoading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader variant="dots" />
      </Center>
    );
  }

  return (
    <React.Fragment>
      <PersistGate persistor={persistor}>
        <Title order={1} className="absolute top-6 left-[154px]">Cohort Discovery</Title>
        <Tabs defaultValue="build" orientation="vertical" classNames={{
          root: 'w-full h-full',
          list: 'bg-base-light before:content-none pt-20',
          tab: 'border-0 border-l-4 rounded-none data-[active=true]:border-accent-warm data-[active=true]:bg-base-max text-center',
          tabLabel: 'w-full',
          panel: 'pt-16'
        }}>
          <Tabs.List>
            {(Object.keys(config.leftNav) as Array<keyof typeof config.leftNav>).map((key)=>{
              return (<Tabs.Tab value={key} key={key} >
                <Image
                  src={config.leftNav[key].image}
                  alt={config.leftNav[key].imageAlt}
                  width={40}
                  height={40}
                  className="inline-block mb-1"
                />
                <strong className="block">{config.leftNav[key].title}</strong>
              </Tabs.Tab>);
            })}
          </Tabs.List>

          <Tabs.Panel value="build">
            <IndexPanel
              dataConfig={config.dataIndexes[0].dataConfig}
              tabTitle={config.dataIndexes[0].tabTitle}
              tabs={config.dataIndexes[0].tabs}
              emptySelection={config.emptySelection}
            />
          </Tabs.Panel>

          <Tabs.Panel value="saved">
            Saved Cohorts tab content
          </Tabs.Panel>

          <Tabs.Panel value="request">
            Request tab content
          </Tabs.Panel>
        </Tabs>
      </PersistGate>
    </React.Fragment>
  );
};

export default CohortDiscovery;
