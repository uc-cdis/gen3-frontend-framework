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
  type UserProfile,
  type JSONObject,
  selectUserDetails,
  useCoreSelector,
} from '@gen3/core';
import GetMissingRequiredIdentityProviders from '../Utils/GetMissingRequiredIdentityProviders';
import { useDisclosure } from '@mantine/hooks';
import downloadManifestClick from '../Utils/downloadManifest';
import { useRouter } from 'next/router';

interface DownloadButtonsRowProps {
  readonly data: JSONObject;
}

const DownloadButtonsRow = ({ data }: DownloadButtonsRowProps) => {
  const router = useRouter();
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
  const accessibleFieldName = '__accessible';
  let userHasAccessToDownload = true;
  enum AccessLevel {
    ACCESSIBLE = 1,
    UNACCESSIBLE = 2,
    WAITING = 3,
    NOT_AVAILABLE = 4,
    OTHER = 5,
    MIXED = 6,
  }
  // if auth is enabled, check if user have access to this study
  if (discoveryConfig.features.authorization?.enabled) {
    userHasAccessToDownload =
      data[accessibleFieldName] === AccessLevel.ACCESSIBLE;
  }
  const showDownloadFileManifestButton =
    discoveryConfig.exportToWorkspace?.enableDownloadManifest;

  type ActiveUser = Partial<UserProfile> & {
    active?: boolean;
    fence_idp?: string;
  };
  const userInfo = useCoreSelector(
    (state: CoreState) => selectUserDetails(state) as ActiveUser,
  );

  const missingRequiredIdentityProviders = GetMissingRequiredIdentityProviders(
    [data],
    userInfo.fence_idp,
  );

  const [opened, { close, open }] = useDisclosure(false);

  /*
  Showing, disabling and downloading logic will addressed: HP-2379, HP-2380, HP-2381, HP-2382

    const showDownloadAllFilesButtons = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.enableDownloadZip,
  );
  */
  // const { discoveryConfig } = useDiscoveryContext();
  /* const showDownloadFileManifestButtons = Boolean(
    discoveryConfig?.features?.exportToWorkspace?.enableDownloadManifest,
  ); */

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
  const downloadManifestButtonText = userInfo.active ? (
    <>Download Manifest</>
  ) : (
    <>
      Login to <br /> Download Manifest
    </>
  );

  const conditionalPopoverText = (() => {
    if (!userHasAccessToDownload) {
      return "You don't have access to this data";
    }
    if (missingRequiredIdentityProviders.length) {
      return missingRequiredIdentityProviders.length > 1
        ? `Data selection requires [${missingRequiredIdentityProviders.join(', ')}] credentials to access. Please change selection to only need one set of credentials and log in using appropriate credentials`
        : `This dataset is only accessible to users who have authenticated via ${missingRequiredIdentityProviders[0]}. Please log in using the ${missingRequiredIdentityProviders[0]} option.`;
    }
    return 'The file is not available for the selected study';
  })();

  const onDownloadStudyLevelMetadata = () => {
    if (!studyMetadata) return;
    downloadJsonFile(
      `${generateDownloadFilename('metadata', studyUID)}.json`,
      studyMetadata,
    );
  };
  const onDownloadAllFiles = () =>
    alert(`called onDownloadAllFiles with resource ${JSON.stringify(data)}`);

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

      {Boolean(showDownloadFileManifestButton) &&
        !missingRequiredIdentityProviders[0] && (
          <>
            <Popover
              width={200}
              position="bottom"
              withArrow
              shadow="md"
              opened={opened}
            >
              <Popover.Target>
                <Button
                  className="discovery-action-bar-button"
                  data-testid="download-manifest"
                  onMouseEnter={open}
                  onMouseLeave={close}
                  onClick={() => {
                    if (!userInfo.active) {
                      // return to this study's details page after logging in
                      void router.push(
                        `/Login?redirect=/Discovery/${encodeURI(studyUID)}`,
                      );
                      return;
                    }
                    downloadManifestClick(
                      discoveryConfig,
                      data,
                      missingRequiredIdentityProviders,
                    );
                  }}
                  disabled={
                    Boolean(userInfo.active) && !userHasAccessToDownload
                  }
                  variant="outline"
                  size="sm"
                >
                  {downloadManifestButtonText}
                </Button>
              </Popover.Target>
              {!userInfo.active && conditionalPopoverText && (
                <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                  {String(conditionalPopoverText)}
                </Popover.Dropdown>
              )}
            </Popover>
          </>
        )}

      <Button onClick={onDownloadAllFiles} variant="outline" size="sm">
        Download All Files
      </Button>
    </div>
  );
};
export default DownloadButtonsRow;
