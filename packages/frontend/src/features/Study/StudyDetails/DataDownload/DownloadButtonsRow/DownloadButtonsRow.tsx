import { JSONObject } from '@gen3/core';
import React from 'react';
import { useDiscoveryContext } from '../../../../Discovery/DiscoveryProvider';
import { Button } from '@mantine/core';

interface DownloadButtonsRowProps {
  readonly data: JSONObject;
}

const DownloadButtonsRow = ({ data }: DownloadButtonsRowProps) => {
  const { discoveryConfig: discoveryConfig } = useDiscoveryContext();
  /*
  Showing, disabling and downloading logic will addressed: HP-2379, HP-2380, HP-2381, HP-2382

  const showDownloadStudyLevelMetadataButton = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.enableDownloadStudyMetadata &&
    studyMetadataFieldNameReference &&
    resourceInfo?.[studyMetadataFieldNameReference],
  );
  const showDownloadFileManifestButtons = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.enableDownloadManifest,
  );
  const showDownloadAllFilesButtons = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.enableDownloadZip,
  );
  const verifyExternalLoginsNeeded = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.verifyExternalLogins,
  );
  const showDownloadVariableMetadataButton = Boolean(
    discoveryConfig.features?.exportToWorkspace?.variableMetadataFieldName &&
    discoveryConfig.features?.exportToWorkspace?.enableDownloadVariableMetadata,n n
  );
  */

  const onDownloadVariableLevelMetadata = () =>
    console.log('called onDownloadVariableLevelMetadata with resource', data);
  const onDownloadStudyLevelMetadata = () =>
    console.log('called onDownloadStudyLevelMetadata with resource', data);
  const onDownloadManifest = () =>
    console.log('called onDownloadManifest with resource', data);
  const onDownloadAllFiles = () =>
    console.log('called onDownloadAllFiles with resource', data);

  return (
    <div className="flex flex-wrap gap-3 mt-3 mb-5">
      <Button
        onClick={onDownloadVariableLevelMetadata}
        variant="outline"
        size="md"
      >
        Download
        <br />
        Variable-Level Metadata
      </Button>
      <Button
        onClick={onDownloadStudyLevelMetadata}
        variant="outline"
        size="md"
      >
        Download
        <br />
        Study-level Metadata
      </Button>
      <Button onClick={onDownloadManifest} variant="outline" size="md">
        Download Manifest
      </Button>
      <Button onClick={onDownloadAllFiles} variant="outline" size="md">
        Download All Files
      </Button>
    </div>
  );
};
export default DownloadButtonsRow;
