import { workspaceAssetsApi } from '@gen3/workspaces/server';

export default workspaceAssetsApi;

export const config = {
  api: {
    responseLimit: '12mb',
  },
};
