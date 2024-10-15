import {
  buildCreateApi,
  coreModule,
  reactHooksModule,
  CreateApi,
  ApiModules,
} from '@reduxjs/toolkit/query/react';
import { useCoreSelector, useCoreStore, useCoreDispatch } from './hooks';

/**
 * Creates a custom Redux Toolkit core API
 * See: https://redux-toolkit.js.org/rtk-query/usage/customizing-create-api
 * @returns: created core API.
 */
const coreCreateApi: CreateApi<keyof ApiModules<any, any, any, any>> =
  buildCreateApi(
    coreModule(),
    reactHooksModule({
      hooks: {
        useSelector: useCoreSelector,
        useStore: useCoreStore as never,
        useDispatch: useCoreDispatch as never,
      },
    }),
  );

export { coreCreateApi };
