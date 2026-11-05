import { gen3Api } from '../gen3';

export interface UpdateMdsStudyArgs {
  mdsURL: string;
  metadataID: string;
  metadataToUpdate: Record<string, unknown>;
}

export const mdsApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    updateStudyInMDS: builder.mutation<void, UpdateMdsStudyArgs>({
      query: ({ mdsURL, metadataID, metadataToUpdate }) => ({
        url: `${mdsURL}/metadata/${metadataID}?overwrite=true`,
        method: 'POST',
        body: metadataToUpdate,
      }),
    }),
  }),
});

export const { useUpdateStudyInMDSMutation } = mdsApi;

type UpdateMdsStudyMutationResult = ReturnType<
  typeof useUpdateStudyInMDSMutation
>;
export type UpdateStudyInMdsMutationTriggerType =
  UpdateMdsStudyMutationResult[0];
