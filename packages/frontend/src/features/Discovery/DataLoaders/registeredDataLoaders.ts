// build a factor function that returns a DataLoader for each type of data
//

import { DiscoverDataHookResponse, DiscoveryDataLoaderProps } from "../types";
import { useAggMDSServer } from "./AggMDSServer/DataLoader";
import { useLoadAllData } from "./MDSAllLocal/DataLoader";

export type DiscoveryDataLoader = (_: DiscoveryDataLoaderProps) => DiscoverDataHookResponse;

const discoveryDataLoaders: Record<string, DiscoveryDataLoader> = {};

export const registerDiscoveryDataLoader = (
  name: string,
  dataLoader: DiscoveryDataLoader
) => {
  discoveryDataLoaders[name] = dataLoader;
};

export const getDiscoveryDataLoader = (name?: string): DiscoveryDataLoader | undefined => {
  console.log("getDiscoveryDataLoader", name, discoveryDataLoaders);
  if (!name || !(name in discoveryDataLoaders)) return undefined;
  return discoveryDataLoaders[name];
};

export const getDiscoveryDataLoaders = (): string[] => {
  return Object.keys(discoveryDataLoaders);
};

export const registerDefaultDiscoveryDataLoaders = () => {
  registerDiscoveryDataLoader("AggMDSServer", useAggMDSServer);
  registerDiscoveryDataLoader("MDSAllLocal", useLoadAllData);
}

registerDefaultDiscoveryDataLoaders();
