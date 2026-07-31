export const createCEDARInstance = async (
  cedarWrapperURL: string,
  cedarUserUUID: string,
  metadataToRegister: any,
): Promise<any> => {
  const STUDY_DATA_FIELD = 'gen3_discovery';
  const cedarCreationURL = `${cedarWrapperURL}/create`;

  // Deep clone or structured clone to prevent mutating the original argument
  let updatedMetadataToRegister = JSON.parse(
    JSON.stringify(metadataToRegister),
  );

  const payload = {
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
  console.log('createCedar payload', payload);

  try {
    // 1st arg: URL string, 2nd arg: Options object
    const response = await fetch(cedarCreationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 201) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    updatedMetadataToRegister[
      STUDY_DATA_FIELD
    ].study_metadata.metadata_location.cedar_study_level_metadata_template_instance_ID =
      data?.cedar_instance_id || '';

    return updatedMetadataToRegister;
  } catch (err: any) {
    throw new Error(
      `Request to create CEDAR instance failed: ${err.message || err}`,
    );
  }
};
