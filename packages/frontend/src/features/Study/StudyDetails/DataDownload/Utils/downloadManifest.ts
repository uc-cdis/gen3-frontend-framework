import { downloadJsonFile } from './downloadJsonFile';
import { generateDownloadFilename } from './generateDownloadFilename';
import type { JSONObject } from '@gen3/core';
import type { DiscoveryIndexConfig } from '../../../../Discovery/types';
import { toString } from 'lodash';

const downloadManifest = (
  config: DiscoveryIndexConfig,
  selectedResource: JSONObject,
  missingRequiredIdentityProviders: string[],
) => {
  const manifestFieldName = config.exportToWorkspace?.manifestFieldName;
  if (!manifestFieldName) {
    throw new Error(
      'Missing required configuration field `exportToWorkspace.manifestFieldName`',
    );
  }
  const uidFieldName = config.minimalFieldMapping.uid || '';

  if (missingRequiredIdentityProviders.length) {
    return;
  }

  const resourceManifest = selectedResource[manifestFieldName] as
    JSONObject[] | undefined;
  if (!resourceManifest) {
    return;
  }

  // since this button is from Discovery Details component, there will only be one study being selected at a time
  const uid = selectedResource[uidFieldName] as string | undefined;
  const filename = generateDownloadFilename('manifest', uid);
  const hostname =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}/`
      : 'http://localhost/';

  const manifest: unknown[] = [];
  if (
    'commons_url' in selectedResource &&
    !hostname.includes(toString(selectedResource.commons_url))
  ) {
    // PlanX addition to allow hostname based DRS in manifest download clients
    manifest.push(
      ...resourceManifest.map((x) => ({
        ...x,
        commons_url:
          'commons_url' in x ? x.commons_url : selectedResource.commons_url,
      })),
    );
  } else {
    manifest.push(...resourceManifest);
  }
  downloadJsonFile(`${filename}.json`, resourceManifest);
};

export default downloadManifest;
