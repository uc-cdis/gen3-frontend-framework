import React, { useMemo, useState } from 'react';
import { Select, Tabs } from '@mantine/core';
import type { DiscoveryConfig, DiscoveryIndexConfig } from './types';
import DiscoveryIndexPanel from './DiscoveryIndexPanel';
import MessagePanel from '../../components/MessagePanel';
import {
  type CoreState,
  selectAuthzMappingData,
  useCoreSelector,
} from '@gen3/core';
import { hasPermission } from '../../lib/authz/hasPermission';
import { toRule } from '../../lib/authz/routeAuthz';
import { mergeDefaultTailwindClassnames } from '../../utils';

const DEFAULT_CLASSNAMES: Record<string, string> = {
  root: 'flex flex-col items-center p-4 w-full bg-base-lightest',
  tab: 'bg-accent-lighter data-active:bg-accent-dark  data-active:text-accent-contrast-dark',
};

const extractLabel = (c: DiscoveryIndexConfig, idx: number) =>
  c.label ?? c.features?.pageTitle?.text ?? `Index ${idx.toString()}`;

export interface DiscoveryProps {
  discoveryConfig: DiscoveryConfig;
}

const Discovery = ({ discoveryConfig }: DiscoveryProps) => {
  const [metadataIndex, setMetadataIndex] = useState<string>('0');

  const authMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  // TODO: add support for mesh authz
  // const meshMapping = useCoreSelector((state: CoreState) =>
  //   selectMeshAuthzMapping(state),
  // );

  const mergedClassnames = useMemo(
    () =>
      mergeDefaultTailwindClassnames(DEFAULT_CLASSNAMES, {
        mergeMode: 'merge',
        ...discoveryConfig.classNames,
      }),
    [discoveryConfig?.classNames],
  );

  const tabItems = useMemo(() => {
    return discoveryConfig.metadataConfig.reduce<
      Array<{
        value: string;
        label: string;
        configuration: DiscoveryIndexConfig;
      }>
    >((items, n, idx) => {
      if (n.authz.length > 0) {
        // check if user has permission for any authz
        const isAuthorized = n.authz.some((x) =>
          hasPermission(authMapping, toRule(x)),
        );
        if (!isAuthorized) {
          return items;
        }
      }
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
    <div className={mergedClassnames.root}>
      <Tabs
        className="w-full"
        defaultValue={metadataIndex}
        variant={discoveryConfig?.tabType}
        onChange={(v: string | null) => {
          setMetadataIndex(v ?? '0');
        }}
        classNames={{
          tab: mergedClassnames.tab,
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
