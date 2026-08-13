import type { TextContentProps } from '../../../components/Content/TextContent';
import type { Gen3AppConfigData } from '../../../lib/content/types';
import type { ButtonVariant } from '@mantine/core';

export interface ConfigStudyRegistrationAccessRequestFormProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

export interface studyRegistrationAccessRequestFormOutcomeProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
  button?: {
    href: string;
    variant?: ButtonVariant;
    text: string;
  };
}

export enum FormOutcome {
  pending = 'pending',
  success = 'success',
  error = 'error',
  userNotLoggedIn = 'userNotLoggedIn',
}

export interface StudyRegistrationServiceResponse extends Record<
  string,
  unknown
> {
  error?: string;
  [key: string]: unknown;
}

export interface MinimalInfo {
  study_name?: string;
  [key: string]: unknown;
}

export interface MetadataLocation {
  nih_application_id?: string;
  [key: string]: unknown;
}

export interface StudyMetadata {
  minimal_info?: MinimalInfo;
  metadata_location?: MetadataLocation;
  [key: string]: unknown;
}

export interface RegisterableStudy {
  _hdp_uid: string;
  project_number?: string;
  registration_authz: string;
  study_metadata?: StudyMetadata;
}

//** Types for Server Response */
export interface UnregisteredStudiesfromMDS {
  _guid_type: string;
  nih_reporter: NihReporter;
  gen3_discovery: RegisterableStudy;
}

export interface NihReporter {
  project_title: string;
}
