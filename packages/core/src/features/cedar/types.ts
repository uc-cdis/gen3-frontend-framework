export interface StudyMetadataLocation {
  nih_application_id?: string;
  cedar_study_level_metadata_template_instance_ID?: string;
}

export interface MinimalInfo {
  study_name?: string;
  study_description?: string;
}

export interface StudyMetadata {
  metadata_location?: StudyMetadataLocation;
  minimal_info?: MinimalInfo;
}

export interface Gen3DiscoveryField {
  study_metadata: {
    metadata_location: StudyMetadataLocation;
    minimal_info?: MinimalInfo;
  };
  [key: string]: unknown;
}

export interface MetadataToRegister {
  gen3_discovery: Gen3DiscoveryField;
  clinicaltrials_gov?: string | undefined;
  [key: string]: unknown;
}
