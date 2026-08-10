const LIMIT = 2000; // required or else mds defaults to returning 10 records
const STUDY_DATA_FIELD = 'gen3_discovery';
const TAG_FIELD = 'tags';

interface valuesToUpdate {
  repository: string;
  repository_study_ids: string | never[];
  clinical_trials_id: string;
  clinicaltrials_gov: object | undefined;
}

export const preprocessStudyRegistrationMetadata = async (
  config: any,
  username: string,
  metadataID: string,
  updatedValues: valuesToUpdate,
  GUIDType = 'discovery_metadata',
) => {
  try {
    const queryURL = `${config.mdsURL}/metadata/${metadataID}`;
    const queryRes = await fetch(queryURL);
    if (queryRes.status !== 200) {
      throw new Error(
        `Request for query study data at ${queryURL} failed with status ${queryRes.status}}`,
      );
    }
    const studyMetadata = await queryRes.json();
    const studyRegistrationValidationField =
      config?.studyRegistrationValidationField;
    const studyRegistrationTrackingField =
      config?.studyRegistrationTrackingField;

    const metadataToUpdate = { ...studyMetadata };
    metadataToUpdate._guid_type = GUIDType;
    if (
      !Object.prototype.hasOwnProperty.call(metadataToUpdate, STUDY_DATA_FIELD)
    ) {
      // it should already be there, but avoid errors if for some reason it's not
      metadataToUpdate.STUDY_DATA_FIELD = {};
    }
    metadataToUpdate[STUDY_DATA_FIELD][studyRegistrationValidationField] = true;
    metadataToUpdate[STUDY_DATA_FIELD][studyRegistrationTrackingField] =
      username;

    // data_repositories related metadata setup
    // check if data_repositories has already been altered before (non-empty)
    if (
      metadataToUpdate[STUDY_DATA_FIELD]?.study_metadata?.metadata_location
        ?.data_repositories &&
      Array.isArray(
        metadataToUpdate[STUDY_DATA_FIELD].study_metadata.metadata_location
          .data_repositories,
      ) &&
      metadataToUpdate[STUDY_DATA_FIELD].study_metadata.metadata_location
        .data_repositories.length === 0
    ) {
      // add all repository_study_ids as separate objects
      let tempStudyIDObj: any = [];
      if (updatedValues.repository_study_ids?.length > 0) {
        tempStudyIDObj = (updatedValues.repository_study_ids as string[]).map(
          (studyId) => ({
            repository_name: updatedValues.repository,
            repository_study_ID: studyId,
          }),
        );
      } else if (updatedValues.repository) {
        tempStudyIDObj = [
          {
            repository_name: updatedValues.repository,
            repository_study_ID: '',
            repository_study_link: '',
            repository_persistent_ID: '',
          },
        ];
      }
      metadataToUpdate[
        STUDY_DATA_FIELD
      ].study_metadata.metadata_location.data_repositories = tempStudyIDObj;
      if (updatedValues.repository) {
        if (!metadataToUpdate[STUDY_DATA_FIELD][TAG_FIELD]) {
          metadataToUpdate[STUDY_DATA_FIELD][TAG_FIELD] = [];
        }
        // don't push duplicated tags
        if (
          !metadataToUpdate[STUDY_DATA_FIELD][TAG_FIELD].includes({
            name: updatedValues.repository,
            category: 'Data Repository',
          })
        ) {
          metadataToUpdate[STUDY_DATA_FIELD][TAG_FIELD].push({
            name: updatedValues.repository,
            category: 'Data Repository',
          });
        }
      }
    }

    metadataToUpdate[
      STUDY_DATA_FIELD
    ].study_metadata.metadata_location.clinical_trials_study_ID =
      updatedValues.clinical_trials_id;
    if (updatedValues.clinical_trials_id) {
      metadataToUpdate.clinicaltrials_gov = updatedValues.clinicaltrials_gov;
    }
    console.log('metadataToUpdate', metadataToUpdate);
    return metadataToUpdate;
  } catch (err) {
    throw new Error(`Request for query MDS failed: ${err}`);
  }
};
