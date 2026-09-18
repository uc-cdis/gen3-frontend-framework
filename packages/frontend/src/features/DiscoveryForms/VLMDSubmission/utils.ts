import { GEN3_FENCE_API, GEN3_MDS_API } from '@gen3/core';
import type { CDEInfo } from './types';
import { toString } from 'lodash';

const LIMIT = 2000;
const MAX_FILENAME_LENGTH = 255;
const INVALID_WINDOWS_FILENAMES = [
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
];
const INVALID_FILENAME_CHARS = /[^a-zA-Z0-9[\]()\s._-]/;

export const validateDataDictionaryName = (name: string): string | null => {
  if (!name.trim()) return 'Data Dictionary Name is required';
  if (name.length > MAX_FILENAME_LENGTH)
    return `Name cannot exceed ${MAX_FILENAME_LENGTH} characters`;
  if (INVALID_WINDOWS_FILENAMES.includes(name.toUpperCase()))
    return 'Name is a reserved file name, please choose a different one';
  if (INVALID_FILENAME_CHARS.test(name))
    return 'Name can only use alphanumeric characters and []() ._-';
  return null;
};

export interface PresignedUploadResponse {
  url: string;
  guid: string;
}

export const generatePresignedURL = async (
  fileName: string,
  authz: string,
  bucketName?: string,
): Promise<PresignedUploadResponse> => {
  const body: { file_name: string; authz: string[]; bucket?: string } = {
    file_name: fileName,
    authz: [authz],
  };
  if (bucketName) body.bucket = bucketName;

  const res = await fetch(`${GEN3_FENCE_API}/data/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status !== 201)
    throw new Error(`Presigned URL request failed with status ${res.status}`);
  const data = await res.json();
  if (!data?.url) throw new Error('No presigned URL returned');
  return data as PresignedUploadResponse;
};

export const cleanUpFileRecord = async (guid: string): Promise<void> => {
  const res = await fetch(`${GEN3_FENCE_API}/data/${guid}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status !== 204)
    console.warn(`Failed to clean up GUID ${guid}: status ${res.status}`);
};

export const uploadToS3 = (
  s3URL: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) resolve();
        else reject(xhr.responseText);
      }
    };
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress((e.loaded / file.size) * 100);
      };
    }
    xhr.open('PUT', s3URL);
    xhr.send(file);
  });

export const loadCDEInfoFromMDS = async (
  guidType = 'cde_metadata',
): Promise<CDEInfo[]> => {
  let allCDEInfo: CDEInfo[] = [];
  let offset = 0;
  let shouldContinue = true;

  while (shouldContinue) {
    const url = `${GEN3_MDS_API}/metadata?data=True&_guid_type=${guidType}&limit=${LIMIT}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CDE metadata request failed: ${res.status}`);
    const json = await res.json();
    const entries: CDEInfo[] = Object.entries(json).map(([k, v]) => {
      const val = v as Record<string, unknown>;
      const drupalID = toString(val.drupal_id ?? '');
      const internalCDEID = toString(val.internal_cde_id ?? '');
      const fileName = toString(val.file_name ?? '');
      const prefix = (drupalID || internalCDEID).trim();
      return {
        drupalID,
        internalCDEID,
        fileName,
        guid: k,
        isCoreCDE: Boolean(val.is_core_cde),
        option: prefix ? `${prefix} ${fileName}`.trim() : fileName,
      };
    });
    allCDEInfo = allCDEInfo.concat(entries);
    if (entries.length < LIMIT) {
      shouldContinue = false;
    } else {
      offset += LIMIT;
    }
  }
  return allCDEInfo;
};

export const updateCDEMetadataInMDS = async (
  metadataID: string,
  updatedCDEInfo: CDEInfo[],
  selectedCoreCDEs: string[],
  variableMetadataField = 'variable_level_metadata',
  gen3DiscoveryField = 'gen3_discovery',
  tagsListFieldName?: string,
): Promise<void> => {
  const queryURL = `${GEN3_MDS_API}/metadata/${metadataID}`;
  const queryRes = await fetch(queryURL);
  if (!queryRes.ok)
    throw new Error(`MDS query failed with status ${queryRes.status}`);
  const studyMetadata = await queryRes.json();
  const metadataToUpdate = { ...studyMetadata };

  if (
    !Object.prototype.hasOwnProperty.call(
      metadataToUpdate,
      variableMetadataField,
    )
  ) {
    metadataToUpdate[variableMetadataField] = {};
  }
  if (
    !Object.prototype.hasOwnProperty.call(
      metadataToUpdate[variableMetadataField],
      'common_data_elements',
    )
  ) {
    metadataToUpdate[variableMetadataField].common_data_elements = {};
  }

  const cdeMetadata = updatedCDEInfo.reduce<Record<string, string>>(
    (acc, entry) => {
      acc[entry.option] = entry.guid;
      return acc;
    },
    {},
  );
  metadataToUpdate[variableMetadataField].common_data_elements = cdeMetadata;

  if (tagsListFieldName && metadataToUpdate[gen3DiscoveryField]) {
    const tags: { name: string; category: string }[] =
      metadataToUpdate[gen3DiscoveryField][tagsListFieldName] ?? [];
    const updatedTags = tags.filter(
      (t) => t.category !== 'Common Data Elements',
    );
    Object.keys(cdeMetadata).forEach((key) =>
      updatedTags.push({ name: key, category: 'Common Data Elements' }),
    );
    metadataToUpdate[gen3DiscoveryField][tagsListFieldName] = updatedTags;
  }

  // unused param kept for potential filter updates
  void selectedCoreCDEs;

  const updateURL = `${GEN3_MDS_API}/metadata/${metadataID}?overwrite=true`;
  const updateRes = await fetch(updateURL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadataToUpdate),
  });
  if (!updateRes.ok)
    throw new Error(`MDS update failed with status ${updateRes.status}`);
};
