// import { UpdateStudyInMdsMutationTriggerType } from './mdsApi';

export const updateStudyInMDS = async (
  mdsURL: string,
  metadataID: string,
  metadataToUpdate: Record<string, any> = {},
  updateMdsQuery: any,
): Promise<any> => {
  try {
    const response = await updateMdsQuery({
      mdsURL,
      metadataID,
      metadataToUpdate,
    }).unwrap();

    return response;
  } catch (err: any) {
    throw new Error(
      `Request for update study data failed: ${err?.message || err}`,
    );
  }
};
