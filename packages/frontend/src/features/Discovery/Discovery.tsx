import React, { useMemo, useState } from 'react';
import { Select, Tabs } from '@mantine/core';
import type { DiscoveryConfig, DiscoveryIndexConfig } from './types';
import DiscoveryIndexPanel from './DiscoveryIndexPanel';
import MessagePanel from '../../components/MessagePanel';
import DiscoveryProvider from './DiscoveryProvider';
import {
  type CoreState,
  selectAuthzMappingData,
  useCoreSelector,
} from '@gen3/core';

const extractLabel = (c: DiscoveryIndexConfig, idx: number) =>
  c.label ?? c.features?.pageTitle?.text ?? `Index ${idx.toString()}`;

export interface DiscoveryProps {
  discoveryConfig: DiscoveryConfig;
}

const Discovery = ({ discoveryConfig }: DiscoveryProps) => {
  const [metadataIndex, setMetadataIndex] = useState<string>('0');

  const needsAuthz = discoveryConfig.metadataConfig.some(
    (x) => x.authz.length > 0,
  );

  const authMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  // const isMesh = !!discoveryConfig?.features?.authorization?.isMesh; = useCoreSelector((state: CoreState) =>
  //   selectMeshAuthzMapping(state),
  // );

  const tabItems = useMemo(() => {
    return discoveryConfig.metadataConfig.reduce<
      Array<{ value: string; label: string; config: DiscoveryIndexConfig }>
    >((items, n, idx) => {
      if (n.authz.length > 0) {
      }
      items.push({
        value: idx.toString(),
        label: extractLabel(n, idx),
        config: n,
      });
      return items;
    }, []);
  }, [discoveryConfig.metadataConfig]);

  if (tabItems.length === 0) {
    return <MessagePanel message="No discovery configuration" />;
  }

  if (tabItems.length === 1) {
    // no need for tabs
    return (
      <DiscoveryProvider
        discoveryIndexConfig={
          discoveryConfig.metadataConfig[0] as DiscoveryIndexConfig
        }
      >
        <DiscoveryIndexPanel indexSelector={null} />
      </DiscoveryProvider>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
      <Tabs
        className="w-full"
        defaultValue={metadataIndex}
        variant={discoveryConfig.metadataConfig[0]?.tabType}
        onChange={(v: string | null) => {
          setMetadataIndex(v ?? '0');
        }}
      >
        <Tabs.List>
          {tabItems.map((item) => (
            <Tabs.Tab key={item.value} value={item.value}>
              {item.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {tabItems.map((item, i) => {
          return (
            <Tabs.Panel value={item.value} key={item.value}>
              <DiscoveryProvider
                discoveryIndexConfig={discoveryConfig.metadataConfig[i]}
              >
                <DiscoveryIndexPanel
                  indexSelector={
                    tabItems.length < 0 ? (
                      <Select
                        label="Metadata:"
                        data={tabItems}
                        value={metadataIndex}
                        onChange={(v: string | null) => {
                          setMetadataIndex(v ?? '0');
                        }}
                      />
                    ) : null
                  }
                />
              </DiscoveryProvider>
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Discovery;
