import { gen3Api } from '../gen3';

export interface CreateCedarPayload {
  cedar_user_uuid: string;
  metadata: {
    study_metadata: {
      metadata_location: {
        nih_application_id?: string;
      };
      minimal_info: {
        study_name?: string;
        study_description?: string;
      };
    };
    clinicaltrials_gov?: string;
  };
}

export interface CreateCedarResponse {
  cedar_instance_id?: string;
}

export const cedarApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    createCedarInstance: builder.mutation<
      CreateCedarResponse,
      { cedarWrapperURL: string; payload: CreateCedarPayload }
    >({
      query: ({ cedarWrapperURL, payload }) => ({
        url: `${cedarWrapperURL}/create`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const { useCreateCedarInstanceMutation } = cedarApi;

// Export mutation trigger function type
type CreateCedarMutationResult = ReturnType<
  typeof useCreateCedarInstanceMutation
>;
export type CreateCedarMutationTriggerType = CreateCedarMutationResult[0];
