import React, { useMemo, useState } from 'react';
import { Button, Popover } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDiscoveryContext } from '../../../../Discovery/DiscoveryProvider';
import {
  downloadVariableMetadata,
  getVariableMetadataRecords,
} from '../Utils/downloadVariableMetadata';
import { downloadJsonFile } from '../Utils/downloadJsonFile';
import { generateDownloadFilename } from '../Utils/generateDownloadFilename';
import { toString } from 'lodash';
import {
  type CoreState,
  type JSONObject,
  selectUserDetails,
  useCoreSelector,
} from '@gen3/core';
import GetMissingRequiredIdentityProviders from '../Utils/GetMissingRequiredIdentityProviders';
import downloadManifestClick from '../Utils/downloadManifest';
import ConditionalPopover from './ConditionalPopover';
import isManifestDataMissing from '../Utils/isManifestDataMissing';
import handleRedirectFromDiscoveryDetailsToLoginClick from '../Utils/handleRedirectFromDiscoveryDetailsToLoginClick';
import { AccessLevel } from '../Utils/constants';

interface DownloadButtonsRowProps {
  readonly data: JSONObject;
}
const DownloadButtonsRow = ({ data }: DownloadButtonsRowProps) => {
  const { discoveryConfig } = useDiscoveryContext();
  const uidField = discoveryConfig.minimalFieldMapping.uid;
  const studyUID = uidField ? toString(data[uidField] ?? '') : '';

  /* Variable Metadata Logic */
  const variableMetadataFieldName = discoveryConfig.variableMetadataFieldName;
  const showDownloadVariableMetadataButton = Boolean(
    variableMetadataFieldName &&
    discoveryConfig.exportToWorkspace?.enableDownloadVariableMetadata,
  );
  const studyName = (
    data.study_metadata as
      { minimal_info?: { study_name?: string } } | undefined
  )?.minimal_info?.study_name;

  /* LOGIC FOR DOWNLOAD MANIFEST */
  const noData = data.length === 0;
  const accessibleFieldName = '__accessible';
  let userHasAccessToDownload = true;

  // if auth is enabled, check if user have access to this study
  if (discoveryConfig.features.authorization?.enabled) {
    userHasAccessToDownload =
      data[accessibleFieldName] === AccessLevel.ACCESSIBLE;
  }
  const showDownloadManifestButton =
    discoveryConfig.exportToWorkspace?.enableDownloadManifest;
  const manifestFieldName =
    discoveryConfig.exportToWorkspace?.manifestFieldName;

  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );
  const isUserLoggedIn = userInfo.active;
  const missingRequiredIdentityProviders = GetMissingRequiredIdentityProviders(
    [data],
    userInfo.fence_idp,
  );
  const isHEALLoginNeeded = Boolean(missingRequiredIdentityProviders.length);
  const downloadManifestButtonText =
    discoveryConfig.exportToWorkspace?.downloadManifestButtonText ||
    'Download Manifest';
  let uid = '';
  if (data) {
    uid = String(data[discoveryConfig.minimalFieldMapping.uid]);
  }
  /* END FOR DOWNLOAD MANIFEST */
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
      `${generateDownloadFilename('metadata', studyUID)}.json`,
      studyMetadata,
    );
  };
  const onDownloadAllFiles = () =>
    alert(`called onDownloadAllFiles with resource ${JSON.stringify(data)}`);

  // This is a placeholder -> will likely need to be implemented as part of download all files
  const [downloadStatus, setDownloadStatus] = useState({ inProgress: false });

  return (
    <div className="flex flex-wrap gap-3 mt-3 mb-5">
      {showDownloadVariableMetadataButton && (
        <Button
          onClick={onDownloadVariableLevelMetadata}
          variant="outline"
          size="sm"
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
          size="sm"
          disabled={downloadingVariableMetadata}
          data-testid="download-study-level-metadata"
        >
          Download
          <br />
          Study-Level Metadata
        </Button>
      )}
      {Boolean(showDownloadManifestButton) && (
        <>
          {isUserLoggedIn && !isHEALLoginNeeded && (
            <>
              <ConditionalPopover
                noData={noData}
                userHasAccessToDownload={userHasAccessToDownload}
                missingRequiredIdentityProviders={
                  missingRequiredIdentityProviders
                }
              >
                <Button
                  className="discovery-action-bar-button"
                  data-testid="download-manifest"
                  variant="outline"
                  size="sm"
                  disabled={
                    isManifestDataMissing(data, String(manifestFieldName)) ||
                    noData ||
                    downloadStatus.inProgress ||
                    !userHasAccessToDownload
                  }
                  onClick={() => {
                    downloadManifestClick(
                      discoveryConfig,
                      data,
                      missingRequiredIdentityProviders,
                    );
                  }}
                >
                  {downloadManifestButtonText}
                </Button>
              </ConditionalPopover>
            </>
          )}
          {(!isUserLoggedIn || isHEALLoginNeeded) && (
            <>
              <ConditionalPopover
                noData={noData}
                userHasAccessToDownload={userHasAccessToDownload}
                missingRequiredIdentityProviders={
                  missingRequiredIdentityProviders
                }
              >
                <Button
                  className="discovery-action-bar-button"
                  data-testid="login-to-download-manifest"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(noData) || downloadStatus.inProgress}
                  onClick={() => {
                    handleRedirectFromDiscoveryDetailsToLoginClick(uid);
                  }}
                >
                  Login to
                  <br /> {downloadManifestButtonText}
                </Button>
              </ConditionalPopover>
            </>
          )}
        </>
      )}
      <Button onClick={onDownloadAllFiles} variant="outline" size="sm">
        Download All Files
      </Button>
    </div>
  );
};
export default DownloadButtonsRow;
