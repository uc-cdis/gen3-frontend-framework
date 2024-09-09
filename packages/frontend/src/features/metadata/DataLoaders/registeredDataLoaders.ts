// build a factor function that returns a DataLoader for each type of data
//

import { useAggMDSServer } from './AggMDSServer/DataLoader';
import {
  useLoadAllMDSData,
  useLoadAllAggMDSData,
} from './MDSAllLocal/DataLoader';
import { useLoadAllIndexedAggMDSData } from './IndexedMetadata/DataLoader';
import { MetadataHookResponse, MetadataLoaderProps } from './types';

export type MetadataLoader = (_: MetadataLoaderProps) => MetadataHookResponse;

const GlobalMetadataLoaders: Record<string, MetadataLoader> = {};

export const registerMetadataLoader = (
  name: string,
  dataLoader: MetadataLoader,
) => {
  GlobalMetadataLoaders[name] = dataLoader;
};

export const getMetadataLoader = (
  name?: string,
): MetadataLoader | undefined => {
  if (name === undefined) {
    console.error('getMetadataLoader: no name provided');
    return undefined;
  }

  if (!(name in GlobalMetadataLoaders)) {
    console.error('getMetadataLoader: no data loader found for', name);
    return undefined;
  }
  return GlobalMetadataLoaders[name];
};

export const getMetadataLoaders = (): string[] => {
  return Object.keys(GlobalMetadataLoaders);
};

export const registerDefaultMetadataLoaders = () => {
  registerMetadataLoader('AggMDSServer', useAggMDSServer);
  registerMetadataLoader('MDSAllLocal', useLoadAllMDSData);
  registerMetadataLoader('AggMDSAllLocal', useLoadAllAggMDSData);
  registerMetadataLoader('IndexedAggMDSAllLocal', useLoadAllIndexedAggMDSData);
};

registerDefaultMetadataLoaders();
