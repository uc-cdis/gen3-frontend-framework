import { createGen3App } from '@gen3/core';
import CrosswalkApp  from './CrosswalkApp';

export const registerApp = () => {
  createGen3App({
    App: CrosswalkApp,
    name: 'crosswalk', version: '0.0.1', requiredEntityTypes: []
  });
};
