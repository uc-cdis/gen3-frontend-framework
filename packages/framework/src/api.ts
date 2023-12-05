import {
  buildCreateApi,
  coreModule,
  reactHooksModule,
  CreateApi,
  ApiModules,
} from "@reduxjs/toolkit/query/react";
import { useCoreSelector, useCoreStore, useCoreDispatch } from "./hooks";

const coreCreateApi: CreateApi<keyof ApiModules<any, any, any, any>> =
  buildCreateApi(
    coreModule(),
    reactHooksModule({
      useSelector: useCoreSelector,
      useStore: useCoreStore as never,
      useDispatch: useCoreDispatch as never,
    }),
  );

export { coreCreateApi };
