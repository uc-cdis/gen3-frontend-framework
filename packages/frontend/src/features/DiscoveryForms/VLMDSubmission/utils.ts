import { GEN3_FENCE_API, GEN3_MDS_API } from '@gen3/core';
import { getCookie } from 'cookies-next';
import type { CDEInfo } from './types';
import { validateFileName } from '../../../utils/fileNames';
import { toString } from 'lodash';
import {
  CDE_METADATA_GUID_TYPE,
  COMMON_DATA_ELEMENTS_FIELD,
  COMMON_DATA_ELEMENTS_FILTER_KEY,
  COMMON_DATA_ELEMENTS_TAG_CATEGORY,
  DEFAULT_GEN3_DISCOVERY_FIELD,
  DEFAULT_VARIABLE_METADATA_FIELD,
  MDS_PAGE_SIZE,
} from './constants';

export const validateDataDictionaryName = (name: string): string | null => {
  if (!name.trim()) return 'Data Dictionary Name is required';
  return validateFileName(name);
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

  const rawToken =
    process.env.NODE_ENV === 'development'
      ? await getCookie('credentials_token')
      : undefined;
  const accessToken = typeof rawToken === 'string' ? rawToken : undefined;

  const res = await fetch(`${GEN3_FENCE_API}/data/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
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
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) resolve();
        else reject(xhr.responseText);
      }
    };
    if (onProgress) {
      xhr.upload.onprogress = (progressEvent) => {
        if (progressEvent.lengthComputable)
          onProgress((progressEvent.loaded / file.size) * 100);
      };
    }
    xhr.open('POST', `/api/vlmdS3Upload?presignedUrl=${encodeURIComponent(s3URL)}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });

export const loadCDEInfoFromMDS = async (
  guidType = CDE_METADATA_GUID_TYPE,
): Promise<CDEInfo[]> => {
  let allCDEInfo: CDEInfo[] = [];
  let offset = 0;
  let shouldContinue = true;

  while (shouldContinue) {
    const url = `${GEN3_MDS_API}/metadata?data=True&_guid_type=${guidType}&limit=${MDS_PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CDE metadata request failed: ${res.status}`);
    const json = await res.json();
    const entries: CDEInfo[] = Object.entries(json).map(([guid, entry]) => {
      const record = entry as Record<string, unknown>;
      const drupalID = toString(record.drupal_id ?? '');
      const internalCDEID = toString(record.internal_cde_id ?? '');
      const fileName = toString(record.file_name ?? '');
      const prefix = (drupalID || internalCDEID).trim();
      return {
        drupalID,
        internalCDEID,
        fileName,
        guid,
        isCoreCDE: Boolean(record.is_core_cde),
        option: prefix ? `${prefix} ${fileName}`.trim() : fileName,
      };
    });
    allCDEInfo = allCDEInfo.concat(entries);
    if (entries.length < MDS_PAGE_SIZE) {
      shouldContinue = false;
    } else {
      offset += MDS_PAGE_SIZE;
    }
  }
  return allCDEInfo;
};

export const updateCDEMetadataInMDS = async (
  metadataID: string,
  updatedCDEInfo: CDEInfo[],
  selectedCoreCDEs: string[],
  variableMetadataField = DEFAULT_VARIABLE_METADATA_FIELD,
  gen3DiscoveryField = DEFAULT_GEN3_DISCOVERY_FIELD,
  tagsListFieldName?: string,
  advSearchFilterField?: string,
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
      COMMON_DATA_ELEMENTS_FIELD,
    )
  ) {
    metadataToUpdate[variableMetadataField][COMMON_DATA_ELEMENTS_FIELD] = {};
  }

  const cdeMetadata = updatedCDEInfo.reduce<Record<string, string>>(
    (acc, entry) => {
      acc[entry.option] = entry.guid;
      return acc;
    },
    {},
  );
  metadataToUpdate[variableMetadataField][COMMON_DATA_ELEMENTS_FIELD] =
    cdeMetadata;

  if (tagsListFieldName && metadataToUpdate[gen3DiscoveryField]) {
    const tags: { name: string; category: string }[] =
      metadataToUpdate[gen3DiscoveryField][tagsListFieldName] ?? [];
    const updatedTags = tags.filter(
      (tag) => tag.category !== COMMON_DATA_ELEMENTS_TAG_CATEGORY,
    );
    Object.keys(cdeMetadata).forEach((key) =>
      updatedTags.push({
        name: key,
        category: COMMON_DATA_ELEMENTS_TAG_CATEGORY,
      }),
    );
    metadataToUpdate[gen3DiscoveryField][tagsListFieldName] = updatedTags;
  }

  if (advSearchFilterField && metadataToUpdate[gen3DiscoveryField]) {
    const filters: { key: string; value: string }[] =
      metadataToUpdate[gen3DiscoveryField][advSearchFilterField] ?? [];
    const updatedFilters = filters.filter(
      (filter) => filter.key !== COMMON_DATA_ELEMENTS_FILTER_KEY,
    );
    selectedCoreCDEs.forEach((coreCDE) =>
      updatedFilters.push({
        key: COMMON_DATA_ELEMENTS_FILTER_KEY,
        value: coreCDE,
      }),
    );
    metadataToUpdate[gen3DiscoveryField][advSearchFilterField] = updatedFilters;
  }

  const rawToken =
    process.env.NODE_ENV === 'development'
      ? await getCookie('credentials_token')
      : undefined;
  const accessToken = typeof rawToken === 'string' ? rawToken : undefined;

  const updateURL = `${GEN3_MDS_API}/metadata/${metadataID}?overwrite=true`;
  const updateRes = await fetch(updateURL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(metadataToUpdate),
  });
  if (!updateRes.ok)
    throw new Error(`MDS update failed with status ${updateRes.status}`);
};
