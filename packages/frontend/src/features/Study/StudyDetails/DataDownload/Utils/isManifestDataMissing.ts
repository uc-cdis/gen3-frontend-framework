import type { JSONObject } from '@gen3/core';

const isManifestDataMissing = (
  resource: JSONObject,
  manifestFieldName: string,
): boolean => {
  const manifest = resource[manifestFieldName];
  return !manifest || (Array.isArray(manifest) && manifest.length === 0);
};

export default isManifestDataMissing;
