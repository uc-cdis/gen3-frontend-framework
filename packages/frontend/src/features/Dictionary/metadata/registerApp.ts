import { createGen3App } from '@gen3/core';
import MetadataDictionary from './MetadataDictionary';

const _APP_NAME = 'MetadataDictionary';

export const registerMetadataSchemaApp = () =>
  createGen3App({
    App: MetadataDictionary,
    name: _APP_NAME,
    version: 'v1.0.0',
    requiredEntityTypes: [],
  });

export const MetadataDictionaryAppName = _APP_NAME;
