import React, { useMemo, useState } from 'react';
import { DiscoveryConfig, DiscoveryIndexConfig } from './types';
import DiscoveryIndexPanel from './DiscoveryIndexPanel';
import { Select } from '@mantine/core';

const extractLabel = (c: DiscoveryIndexConfig, idx: number) =>
  c.label ?? c.features?.pageTitle?.text ?? `Index ${idx.toString()}`;

export interface DiscoveryProps {
  discoveryConfig: DiscoveryConfig;
}

const Discovery = ({ discoveryConfig }: DiscoveryProps) => {
  const [metadataIndex, setMetadataIndex] = useState<string>('0');

  const menuItems = useMemo(() => {
    return discoveryConfig.metadataConfig.map((n, idx) => {
      return { value: idx.toString(), label: extractLabel(n, idx) };
    });
  }, [discoveryConfig.metadataConfig]);

  return (
    <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
      <DiscoveryIndexPanel
        discoveryConfig={
          discoveryConfig.metadataConfig[Number.parseInt(metadataIndex)]
        }
        indexSelector={
          menuItems.length > 1 ? (
            <Select
              label="Metadata:"
              data={menuItems}
              value={metadataIndex}
              onChange={(v: string | null) => {
                setMetadataIndex(v ?? '0');
              }}
            />
          ) : null
        }
      />
    </div>
  );
};

export default Discovery;
