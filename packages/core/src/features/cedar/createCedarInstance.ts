import { CreateCedarMutationTriggerType, CreateCedarPayload } from './cedarApi';

export const createCEDARInstance = async (
  cedarWrapperURL: string,
  cedarUserUUID: string,
  metadataToRegister: any,
  createCedarQuery: CreateCedarMutationTriggerType,
): Promise<any> => {
  const STUDY_DATA_FIELD = 'gen3_discovery';

  // Deep clone to prevent mutating original metadata
  let updatedMetadataToRegister = JSON.parse(
    JSON.stringify(metadataToRegister),
  );

  const payload: CreateCedarPayload = {
    cedar_user_uuid: cedarUserUUID,
    metadata: {
      study_metadata: {
        metadata_location: {
          nih_application_id:
            metadataToRegister[STUDY_DATA_FIELD]?.study_metadata
              ?.metadata_location?.nih_application_id,
        },
        minimal_info: {
          study_name:
            metadataToRegister[STUDY_DATA_FIELD]?.study_metadata?.minimal_info
              ?.study_name,
          study_description:
            metadataToRegister[STUDY_DATA_FIELD]?.study_metadata?.minimal_info
              ?.study_description,
        },
      },
      clinicaltrials_gov: metadataToRegister.clinicaltrials_gov,
    },
  };

  try {
    // Call the mutation trigger passed in from the component
    const data = await createCedarQuery({
      cedarWrapperURL,
      payload,
    }).unwrap();

    updatedMetadataToRegister[
      STUDY_DATA_FIELD
    ].study_metadata.metadata_location.cedar_study_level_metadata_template_instance_ID =
      data?.cedar_instance_id || '';

    return updatedMetadataToRegister;
  } catch (err: any) {
    const errorMsg = JSON.stringify(err);
    return {
      error: `Request to create CEDAR instance failed: ${errorMsg}`,
    };
  }
};
