import React, { useMemo, useState } from 'react';
import { Select, Tabs } from '@mantine/core';
import type { DiscoveryConfig, DiscoveryIndexConfig } from './types';
import DiscoveryIndexPanel from './DiscoveryIndexPanel';
import MessagePanel from '../../components/MessagePanel';
import {
  type CoreState,
  selectAuthzMappingData,
  selectMeshAuthzMapping,
  selectUserDetails,
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

  const userProfile = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  const authMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  console.log('userProfile', userProfile);

  const meshMapping = useCoreSelector((state: CoreState) =>
    selectMeshAuthzMapping(state),
  );

  console.log('authMapping', authMapping);
  console.log('meshMapping', meshMapping);

  const tabItems = useMemo(() => {
    return discoveryConfig.metadataConfig.reduce<
      Array<{
        value: string;
        label: string;
        configuration: DiscoveryIndexConfig;
      }>
    >((items, n, idx) => {
      // if (n.authz.length > 0) {
      //   // check to see if user has the authz
      //   // if (!userProfile.authz?.includes(n.authz[0])) {
      //   //   return items;
      //   }
      items.push({
        value: idx.toString(),
        label: extractLabel(n, idx),
        configuration: n,
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
      <DiscoveryIndexPanel
        indexSelector={null}
        configuration={tabItems[0].configuration}
      />
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
              <DiscoveryIndexPanel
                configuration={item.configuration}
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
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Discovery;
