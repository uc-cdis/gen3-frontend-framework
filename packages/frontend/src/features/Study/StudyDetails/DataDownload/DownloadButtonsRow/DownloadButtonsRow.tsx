import React, { useMemo, useState } from 'react';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDiscoveryContext } from '../../../../Discovery/DiscoveryProvider';
import {
  downloadVariableMetadata,
  getVariableMetadataRecords,
} from '../Utils/downloadVariableMetadata';
import { downloadJsonFile } from '../Utils/downloadJsonFile';
import { generateFilenameWithoutPrefix } from '../Utils/generateFilenameWithoutPrefix';
import { toString } from 'lodash';
import type { JSONObject } from '@gen3/core';

interface DownloadButtonsRowProps {
  readonly data: JSONObject;
}

const DownloadButtonsRow = ({ data }: DownloadButtonsRowProps) => {
  /*
  Showing, disabling and downloading logic will addressed: HP-2379, HP-2380, HP-2381, HP-2382

  const { discoveryConfig: discoveryConfig } = useDiscoveryContext();
  const showDownloadFileManifestButtons = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.enableDownloadManifest,
  );
  const showDownloadAllFilesButtons = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.enableDownloadZip,
  );
  const verifyExternalLoginsNeeded = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.verifyExternalLogins,
  );
  */

  const { discoveryConfig } = useDiscoveryContext();
  const variableMetadataFieldName = discoveryConfig.variableMetadataFieldName;
  const showDownloadVariableMetadataButton = Boolean(
    variableMetadataFieldName &&
    discoveryConfig.exportToWorkspace?.enableDownloadVariableMetadata,
  );
  const uidField = discoveryConfig.minimalFieldMapping.uid;
  const studyUID = uidField ? toString(data[uidField] ?? '') : '';
  const studyName = (
    data.study_metadata as
      { minimal_info?: { study_name?: string } } | undefined
  )?.minimal_info?.study_name;

  const variableMetadataRecords = useMemo(
    () => getVariableMetadataRecords(data, variableMetadataFieldName),
    [data, variableMetadataFieldName],
  );
  const [downloadingVariableMetadata, setDownloadingVariableMetadata] =
    useState(false);

  const onDownloadVariableLevelMetadata = async () => {
    if (!variableMetadataRecords) return;
    setDownloadingVariableMetadata(true);
    try {
      await downloadVariableMetadata(
        variableMetadataRecords,
        studyUID,
        studyName,
      );
    } catch (error) {
      console.error('Variable-level metadata download failed:', error);
      notifications.show({
        title: 'Download failed',
        color: 'red',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to download variable-level metadata. Please try again later.',
      });
    } finally {
      setDownloadingVariableMetadata(false);
    }
  };
  const studyMetadataFieldName =
    discoveryConfig.exportToWorkspace?.studyMetadataFieldName;
  const studyMetadata = studyMetadataFieldName
    ? data[studyMetadataFieldName]
    : undefined;
  const showDownloadStudyLevelMetadataButton = Boolean(
    discoveryConfig.exportToWorkspace?.enableDownloadStudyMetadata &&
    studyMetadata,
  );

  const onDownloadStudyLevelMetadata = () => {
    if (!studyMetadata) return;
    downloadJsonFile(
      `${generateFilenameWithoutPrefix('metadata', studyUID)}.json`,
      studyMetadata,
    );
  };
  const onDownloadManifest = () =>
    alert(`called onDownloadManifest with resource ${JSON.stringify(data)}`);
  const onDownloadAllFiles = () =>
    alert(`called onDownloadAllFiles with resource ${JSON.stringify(data)}`);

  return (
    <div className="flex flex-wrap gap-3 mt-3 mb-5">
      {showDownloadVariableMetadataButton && (
        <Button
          onClick={onDownloadVariableLevelMetadata}
          variant="outline"
          size="md"
          disabled={!variableMetadataRecords}
          loading={downloadingVariableMetadata}
          data-testid="download-variable-level-metadata"
        >
          Download
          <br />
          Variable-Level Metadata
        </Button>
      )}
      {showDownloadStudyLevelMetadataButton && (
        <Button
          onClick={onDownloadStudyLevelMetadata}
          variant="outline"
          size="md"
          disabled={downloadingVariableMetadata}
          data-testid="download-study-level-metadata"
        >
          Download
          <br />
          Study-Level Metadata
        </Button>
      )}
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
