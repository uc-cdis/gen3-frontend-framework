import {
  buildCreateApi,
  coreModule,
  reactHooksModule,
} from '@reduxjs/toolkit/dist/query/react';
import { useCoreSelector, useCoreStore, useCoreDispatch } from './hooks';

export const coreCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    // TODO properly type the next two declarations.
    useSelector: useCoreSelector,
    useStore: useCoreStore as never,
    useDispatch: useCoreDispatch as never,
  }),
);
