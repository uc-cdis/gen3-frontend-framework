import type { JobBuilderAction } from '@gen3/core';

export interface CreatePBFromDataLibraryListParams {
  listId: string;
}

const isCreatePBFromDataLibraryListParams = (
  params: unknown,
): params is CreatePBFromDataLibraryListParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'listId' in params &&
    typeof (params as CreatePBFromDataLibraryListParams).listId === 'string'
  );
};

/**
 * Creates an job to create a PFB from a data library list
 */
export const createPFBFromDataLibraryList: JobBuilderAction = (params) => {
  if (!isCreatePBFromDataLibraryListParams(params)) {
    throw new Error('Invalid parameters: listId not set');
  }
  return {
    action: 'export-user-data-library',
    input: {
      list_id: params.listId,
    },
  };
};
