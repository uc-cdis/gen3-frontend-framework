import { toString } from 'lodash';
import type { UpdateStudyInMdsMutationTriggerType } from './mdsApi';

export const updateStudyInMDS = async (
  mdsURL: string,
  metadataID: string,
  metadataToUpdate: Record<string, unknown> = {},
  updateMdsQuery: UpdateStudyInMdsMutationTriggerType,
): Promise<unknown> => {
  try {
    const response = await updateMdsQuery({
      mdsURL,
      metadataID,
      metadataToUpdate,
    }).unwrap();

    return response;
  } catch (error: unknown) {
    throw new Error(
      `Request for update study data failed: ${(error instanceof Error && error.message) || toString(error)}`,
    );
  }
};
