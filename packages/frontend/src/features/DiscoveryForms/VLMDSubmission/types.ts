import type { RemoteSupportConfiguration } from '@gen3/core';

export interface VLMDSubmissionConfig {
  dataDictionarySubmissionBucket?: string;
  variableMetadataField?: string;
  gen3DiscoveryField?: string;
  tagsListFieldName?: string;
  remoteSupportService: {
    service: string;
    configuration: RemoteSupportConfiguration;
  };
}

export interface VLMDSubmissionProps {
  studyUID?: string;
  studyNumber?: string;
  studyName?: string;
  studyRegistrationAuthZ?: string;
  userHasAccessToSubmit: boolean;
  disableCDESubmissionForm: boolean;
  config: VLMDSubmissionConfig;
  existingDataDictionaryNames?: string[];
  existingCDENames?: string[];
}

export interface CDEInfo {
  drupalID: string;
  internalCDEID: string;
  fileName: string;
  guid: string;
  isCoreCDE: boolean;
  option: string;
}

export type FormSubmissionStatus =
  | { status: 'success' }
  | { status: 'info'; text: string }
  | { status: 'error'; text: string };
