import { buildCreateApi, coreModule, reactHooksModule } from '@reduxjs/toolkit/dist/query/react';
import { useCoreSelector, useCoreStore, useCoreDispatch } from './hooks';


export const coreCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({

    // TODO properly type the next two declarations.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useSelector: useCoreSelector,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useStore: useCoreStore,
    useDispatch: useCoreDispatch,
  }),
);
