import {
  buildCreateApi,
  coreModule,
  reactHooksModule,
  CreateApi,
  ApiModules,
} from '@reduxjs/toolkit/query/react';

import { useAppSelector, useAppDispatch, useAppStore } from './appApi';

const appCreateApi: CreateApi<keyof ApiModules<any, any, any, any>> =
  buildCreateApi(
    coreModule(),
    reactHooksModule({
      hooks: {
        useSelector: useAppSelector,
        useStore: useAppStore,
        useDispatch: useAppDispatch,
      },
    }),
  );

export { appCreateApi };
